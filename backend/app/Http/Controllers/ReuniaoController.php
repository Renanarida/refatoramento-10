<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reuniao;
use App\Models\ReuniaoParticipante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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

        $total = (clone $base)->count();
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
            'participantes.*.nome' => 'nullable|string|max:255',
            'participantes.*.email' => 'nullable|email|max:255',
            'participantes.*.papel' => 'nullable|string|max:100',
        ]);

        $userId = \App\Models\User::value('id');

        $reuniao = Reuniao::create([
            'user_id' => $userId,
            'titulo' => $data['titulo'],
            'descricao' => $data['descricao'] ?? null,
            'data' => substr($data['data'], 0, 10),
            'hora' => $data['hora'],
            'local' => $data['local'] ?? null,
            'metadados' => $data['metadados'] ?? null,
        ]);

        foreach (($data['participantes'] ?? []) as $p) {
            ReuniaoParticipante::create([
                'reuniao_id' => $reuniao->id,
                'nome' => $p['nome'] ?? null,
                'email' => $p['email'] ?? null,
                'papel' => $p['papel'] ?? null,
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
            'participantes.*.nome' => 'nullable|string|max:255',
            'participantes.*.email' => 'nullable|email|max:255',
            'participantes.*.papel' => 'nullable|string|max:100',
        ]);

        $reuniao->fill($data)->save();

        if (array_key_exists('participantes', $data)) {
            $reuniao->participantes()->delete();
            foreach ($data['participantes'] ?? [] as $p) {
                ReuniaoParticipante::create([
                    'reuniao_id' => $reuniao->id,
                    'nome' => $p['nome'] ?? null,
                    'email' => $p['email'] ?? null,
                    'papel' => $p['papel'] ?? null,
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

    // ===================== NOVOS MÉTODOS =====================

    // GET /api/public/reunioes
    public function publicIndex(Request $req)
    {
        return Reuniao::query()
            ->select('id', 'titulo', 'data', 'hora', 'local')
            ->orderBy('data', 'desc')
            ->paginate($req->integer('per_page', 10));
    }

    // GET /api/participante/reunioes
    public function participantIndex(Request $req)
    {
        $cpf = $req->attributes->get('cpf_participante');
        if (!$cpf) {
            return response()->json(['message' => 'CPF obrigatório'], 400);
        }

        $cpfDigits = preg_replace('/\D+/', '', $cpf);

        return Reuniao::query()
            ->select(
                'reunioes.id',
                'reunioes.titulo',
                'reunioes.data',
                'reunioes.hora',
                'reunioes.local',
                'reunioes.descricao'
            )
            ->join('reuniao_participantes as rp', 'rp.reuniao_id', '=', 'reunioes.id')
            ->whereRaw('REPLACE(REPLACE(REPLACE(rp.cpf,".",""),"-","")," ","") = ?', [$cpfDigits])
            ->orderBy('reunioes.data', 'desc')
            ->paginate($req->integer('per_page', 10));
    }

    // GET /api/participante/reunioes/{id}
    public function participantShow(Request $req, $id)
    {
        $cpf = $req->attributes->get('cpf_participante');
        if (!$cpf) {
            return response()->json(['message' => 'CPF obrigatório'], 400);
        }

        $cpfDigits = preg_replace('/\D+/', '', $cpf);

        $reuniao = Reuniao::query()
            ->with(['participantes' => function ($q) {
                $q->select('id', 'reuniao_id', 'nome', 'email', 'papel'); // não expõe CPF
            }])
            ->where('reunioes.id', $id)
            ->whereExists(function ($q) use ($cpfDigits) {
                $q->from('reuniao_participantes as rp')
                  ->whereColumn('rp.reuniao_id', 'reunioes.id')
                  ->whereRaw('REPLACE(REPLACE(REPLACE(rp.cpf,".",""),"-","")," ","") = ?', [$cpfDigits]);
            })
            ->first();

        if (!$reuniao) {
            return response()->json(['message' => 'Não autorizado ou não encontrado'], 404);
        }

        return $reuniao;
    }
}
