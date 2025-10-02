<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reuniao;
use App\Models\ReuniaoParticipante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReuniaoController extends Controller
{
    // GET /api/reunioes?q=...&data_ini=YYYY-MM-DD&data_fim=YYYY-MM-DD&page&per_page
    public function index(Request $req)
    {
        $q = Reuniao::query()
            ->with('participantes')
            ->when($req->filled('data_ini'), fn($qq) => $qq->whereDate('data', '>=', $req->input('data_ini')))
            ->when($req->filled('data_fim'), fn($qq) => $qq->whereDate('data', '<=', $req->input('data_fim')))
            ->when($req->filled('q'), function ($qq) use ($req) {
                $term = '%' . $req->input('q') . '%';
                $qq->where(function ($w) use ($term) {
                    $w->where('titulo', 'like', $term)->orWhere('descricao', 'like', $term);
                });
            })
            ->orderBy('data')->orderBy('hora');

        return $q->paginate($req->integer('per_page', 10));
    }

    /**
     * GET /api/reunioes/stats  -> usado pelos cards
     */
    public function stats()
    {
        $now = now('America/Sao_Paulo');
        $end48 = $now->copy()->addHours(48);

        $base = Reuniao::query();

        $total       = (clone $base)->count();
        $hojeCount   = (clone $base)->whereDate('data', $now->toDateString())->count();
        $amanhaCount = (clone $base)->whereDate('data', $now->copy()->addDay()->toDateString())->count();

        $prox48hCount = Reuniao::whereBetween(
            DB::raw("TIMESTAMP(data, COALESCE(hora, '00:00:00'))"),
            [$now->toDateTimeString(), $end48->toDateTimeString()]
        )->count();

        return response()->json([
            'resumo' => [
                'total'         => $total,
                'hoje'          => $hojeCount,
                'amanha'        => $amanhaCount,
                'proximas_48h'  => $prox48hCount,
            ],
            'ref' => [
                'agora'    => $now->toDateTimeString(),
                'ate_48h'  => $end48->toDateTimeString(),
                'tz'       => 'America/Sao_Paulo',
            ],
        ]);
    }

    public function cards()
    {
        return $this->stats();
    }

    // POST /api/reunioes
    public function store(Request $req)
    {
        $data = $req->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'data' => 'required|date_format:Y-m-d',
            'hora' => 'required|date_format:H:i',
            'local' => 'nullable|string|max:255',
            'metadados' => 'nullable|array',
            'participantes' => 'nullable|array',
            'participantes.*.nome'     => 'nullable|string|max:255',
            'participantes.*.email'    => 'nullable|email|max:255',
            // 'participantes.*.telefone' => 'nullable|string|max:30', // ✅
            'participantes.*.papel'    => 'nullable|string|max:100',
            'participantes.*.cpf'      => 'nullable|string|max:20',
        ]);

        // Ajuste se tiver Auth: aqui só pegamos algum user_id (ex.: primeiro)
        $userId = \App\Models\User::value('id');

        $reuniao = Reuniao::create([
            'user_id'   => $userId,
            'titulo'    => $data['titulo'],
            'descricao' => $data['descricao'] ?? null,
            'data'      => substr($data['data'], 0, 10),
            'hora'      => $data['hora'],
            'local'     => $data['local'] ?? null,
            'metadados' => $data['metadados'] ?? null,
        ]);

        foreach (($data['participantes'] ?? []) as $p) {
            $cpf = isset($p['cpf']) ? preg_replace('/\D/', '', $p['cpf']) : null;

            if ($cpf) {
                if (!$this->validaCpf($cpf)) {
                    return response()->json(['message' => 'CPF inválido em participantes.'], 422);
                }
                $jaExiste = ReuniaoParticipante::where('reuniao_id', $reuniao->id)
                    ->where('cpf', $cpf)
                    ->exists();
                if ($jaExiste) {
                    return response()->json(['message' => 'Este CPF já está cadastrado nesta reunião.'], 422);
                }
            }

            ReuniaoParticipante::create([
                'reuniao_id' => $reuniao->id,
                'nome'       => $p['nome']     ?? null,
                'email'      => $p['email']    ?? null,
                // 'telefone'   => $p['telefone'] ?? null, // ✅
                'papel'      => $p['papel']    ?? null,
                'cpf'        => $cpf,
            ]);
        }

        return response()->json($reuniao->load('participantes'), 201);
    }

    // GET /api/reunioes/{reuniao}
    public function show(Reuniao $reuniao)
    {
        return $reuniao->load('participantes');
    }

    // PUT /api/reunioes/{reuniao}
    public function update(Request $req, Reuniao $reuniao)
    {
        $data = $req->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'data' => 'sometimes|required|date_format:Y-m-d',
            'hora' => 'sometimes|required|date_format:H:i',
            'local' => 'nullable|string|max:255',
            'metadados' => 'nullable|array',
            'participantes' => 'nullable|array',
            'participantes.*.nome'     => 'nullable|string|max:255',
            'participantes.*.email'    => 'nullable|email|max:255',
            // 'participantes.*.telefone' => 'nullable|string|max:30', // 👈 AQUI
            'participantes.*.papel'    => 'nullable|string|max:100',
            'participantes.*.cpf'      => 'nullable|string|max:20',
        ]);

        $reuniao->fill($data)->save();

        if (array_key_exists('participantes', $data)) {
            // Estratégia simples: zera e recria (poderia ser upsert)
            $reuniao->participantes()->delete();

            foreach ($data['participantes'] ?? [] as $p) {
                $cpf = isset($p['cpf']) ? preg_replace('/\D/', '', $p['cpf']) : null;

                if ($cpf) {
                    if ($cpf && strlen($cpf) !== 11) {
                        return response()->json(['message' => 'CPF deve ter 11 dígitos.'], 422);
                    }
                    $jaExiste = ReuniaoParticipante::where('reuniao_id', $reuniao->id)
                        ->where('cpf', $cpf)
                        ->exists();
                    if ($jaExiste) {
                        return response()->json(['message' => 'Este CPF já está cadastrado nesta reunião.'], 422);
                    }
                }

                ReuniaoParticipante::create([
                    'reuniao_id' => $reuniao->id,
                    'nome'       => $p['nome']     ?? null,
                    'email'      => $p['email']    ?? null,
                    // 'telefone'   => $p['telefone'] ?? null, // 👈 AQUI
                    'papel'      => $p['papel']    ?? null,
                    'cpf'        => $cpf,
                ]);
            }
        }

        return $reuniao->load('participantes');
    }

    // DELETE /api/reunioes/{reuniao}
    public function destroy(Reuniao $reuniao)
    {
        $reuniao->delete();
        return response()->json(['status' => 'ok']);
    }

    // ===================== MÉTODOS PÚBLICOS/PARTICIPANTE =====================

    // GET /api/public/reunioes (lista simples pública)
    public function publicIndex(Request $req)
    {
        return Reuniao::query()
            ->select('id', 'titulo', 'data', 'hora', 'local')
            ->orderBy('data', 'desc')
            ->paginate($req->integer('per_page', 10));
    }

    // GET /api/participante/reunioes  (?cpf=XXXXXXXXXXX)
    public function participantIndex(Request $req)
    {
        // Se existir middleware que injete atributo, usa; senão, pega da querystring
        $cpf = $req->attributes->get('cpf_participante') ?? $req->input('cpf');

        if (!$cpf) {
            return response()->json(['message' => 'CPF obrigatório'], 400);
        }

        $cpfDigits = preg_replace('/\D+/', '', $cpf);
        if (strlen($cpfDigits) !== 11 || !$this->validaCpf($cpfDigits)) {
            return response()->json(['message' => 'CPF inválido'], 422);
        }

        return Reuniao::query()
            ->select('reunioes.id', 'reunioes.titulo', 'reunioes.data', 'reunioes.hora', 'reunioes.local', 'reunioes.descricao')
            ->join('reuniao_participantes as rp', 'rp.reuniao_id', '=', 'reunioes.id')
            ->where('rp.cpf', $cpfDigits)
            ->orderBy('reunioes.data', 'desc')
            ->paginate($req->integer('per_page', 10));
    }

    // GET /api/participante/reunioes/{id}  (?cpf=XXXXXXXXXXX)
    public function participantShow(Request $req, $id)
    {
        $cpf = $req->attributes->get('cpf_participante') ?? $req->input('cpf');
        if (!$cpf) {
            return response()->json(['message' => 'CPF obrigatório'], 400);
        }

        $cpfDigits = preg_replace('/\D+/', '', $cpf);
        if (strlen($cpfDigits) !== 11 || !$this->validaCpf($cpfDigits)) {
            return response()->json(['message' => 'CPF inválido'], 422);
        }

        $reuniao = Reuniao::query()
            ->with(['participantes' => function ($q) {
                // não expor CPF nesta listagem
                $q->select('id', 'reuniao_id', 'nome', 'email', 'papel');
            }])
            ->where('reunioes.id', $id)
            ->whereExists(function ($q) use ($cpfDigits) {
                $q->from('reuniao_participantes as rp')
                    ->whereColumn('rp.reuniao_id', 'reunioes.id')
                    ->where('rp.cpf', $cpfDigits);
            })
            ->first();

        if (!$reuniao) {
            return response()->json(['message' => 'Não autorizado ou não encontrado'], 404);
        }

        return $reuniao;
    }

    // ===================== UTIL =====================

    private function validaCpf(string $cpf): bool
    {
        if (strlen($cpf) !== 11 || preg_match('/^(\\d)\\1{10}$/', $cpf)) return false;
        for ($t = 9; $t < 11; $t++) {
            $d = 0;
            for ($c = 0; $c < $t; $c++) $d += (int)$cpf[$c] * (($t + 1) - $c);
            $d = ((10 * $d) % 11) % 10;
            if ((int)$cpf[$t] !== $d) return false;
        }
        return true;
    }
}
