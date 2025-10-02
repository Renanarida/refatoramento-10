<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reuniao;
use App\Models\ReuniaoParticipante;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
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


    public function statsPeriodos()
{
    $tz  = 'America/Sao_Paulo';
    $now = now($tz);

    // Limites
    $iniSemana = $now->copy()->startOfWeek(); // seg-dom (ajuste se quiser)
    $fimSemana = $now->copy()->endOfWeek();

    $iniMes = $now->copy()->startOfMonth();
    $fimMes = $now->copy()->endOfMonth();

    $iniAno = $now->copy()->startOfYear();
    $fimAno = $now->copy()->endOfYear();

    // Totais
    $totalSemana = Reuniao::whereBetween('data', [$iniSemana->toDateString(), $fimSemana->toDateString()])->count();

    $totalMes = Reuniao::whereYear('data', $now->year)
        ->whereMonth('data', $now->month)
        ->count();

    $totalAno = Reuniao::whereYear('data', $now->year)->count();

    // Séries (opcional para gráficos mais ricos)
    $semanaPorDia = Reuniao::select([
            DB::raw('DATE(data) as dia'),
            DB::raw('COUNT(*) as total')
        ])
        ->whereBetween('data', [$iniSemana->toDateString(), $fimSemana->toDateString()])
        ->groupBy('dia')
        ->orderBy('dia')
        ->get();

    $mesPorDia = Reuniao::select([
            DB::raw('DATE(data) as dia'),
            DB::raw('COUNT(*) as total')
        ])
        ->whereBetween('data', [$iniMes->toDateString(), $fimMes->toDateString()])
        ->groupBy('dia')
        ->orderBy('dia')
        ->get();

    $anoPorMes = Reuniao::select([
            DB::raw('DATE_FORMAT(data, "%Y-%m") as ym'),
            DB::raw('COUNT(*) as total')
        ])
        ->whereBetween('data', [$iniAno->toDateString(), $fimAno->toDateString()])
        ->groupBy('ym')
        ->orderBy('ym')
        ->get();

    return response()->json([
        'ref' => [
            'tz'        => $tz,
            'agora'     => $now->toDateTimeString(),
            'semana'    => ['inicio' => $iniSemana->toDateString(), 'fim' => $fimSemana->toDateString()],
            'mes'       => ['inicio' => $iniMes->toDateString(),   'fim' => $fimMes->toDateString()],
            'ano'       => ['inicio' => $iniAno->toDateString(),   'fim' => $fimAno->toDateString()],
        ],
        'contagens' => [
            'semana' => $totalSemana,
            'mes'    => $totalMes,
            'ano'    => $totalAno,
        ],
        'series' => [
            'semana_por_dia' => $semanaPorDia, // [{ dia: '2025-10-01', total: 3 }, ...]
            'mes_por_dia'    => $mesPorDia,    // idem
            'ano_por_mes'    => $anoPorMes,    // [{ ym: '2025-01', total: 10 }, ...]
        ],
    ]);
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

    /**
     * GET /api/reunioes/{id}/participantes-by-cpf?cpf=XXXXXXXXXXX
     * Retorna os participantes da reunião SOMENTE se o CPF informado participa dela.
     * Não expõe CPFs dos demais participantes.
     */
    public function participantesByCpf($id, Request $request)
    {
        $cpf = $request->attributes->get('cpf_participante') // caso algum middleware injete
            ?? $request->query('cpf')                        // querystring
            ?? null;

        if (!$cpf) {
            return response()->json(['message' => 'CPF obrigatório'], Response::HTTP_BAD_REQUEST);
        }

        $cpfDigits = preg_replace('/\D+/', '', $cpf);
        if (strlen($cpfDigits) !== 11 || !$this->validaCpf($cpfDigits)) {
            return response()->json(['message' => 'CPF inválido'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Verifica se o CPF pertence à reunião
        $pertence = ReuniaoParticipante::where('reuniao_id', $id)
            ->where('cpf', $cpfDigits)
            ->exists();

        if (!$pertence) {
            return response()->json(['message' => 'Forbidden — CPF não pertence a esta reunião'], Response::HTTP_FORBIDDEN);
        }

        // Carrega participantes sem expor CPF
        $reuniao = Reuniao::with(['participantes' => function ($q) {
                $q->select('id', 'reuniao_id', 'nome', 'email', 'papel');
            }])
            ->findOrFail($id);

        return response()->json([
            'participantes' => $reuniao->participantes,
            'reuniao_id'    => $reuniao->id,
        ], Response::HTTP_OK);
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
