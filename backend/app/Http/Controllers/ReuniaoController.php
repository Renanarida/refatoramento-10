<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reuniao;
use App\Models\ReuniaoParticipante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;           // <-- novo
use Carbon\Carbon;                           // <-- novo

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
     * Conta total, hoje, amanhã e próximas 48h (considerando data+hora).
     * Mantém o payload no formato { resumo: { total, hoje, amanha, proximas_48h }, ref: {...} }
     */
    public function stats()
    {
        // timezone consistente com o app
        $now = now('America/Sao_Paulo');            // Carbon instance
        $end48 = $now->copy()->addHours(48);

        $base = Reuniao::query();

        $total = (clone $base)->count();

        $hojeCount   = (clone $base)->whereDate('data', $now->toDateString())->count();
        $amanhaCount = (clone $base)->whereDate('data', $now->copy()->addDay()->toDateString())->count();

        // Próximas 48h considerando data+hora (se 'hora' for null, usa 00:00:00)
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

    // Compat: se seu front estiver chamando /reunioes/cards
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

        // pega o primeiro usuário da tabela users (pra não quebrar a FK)
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
}
