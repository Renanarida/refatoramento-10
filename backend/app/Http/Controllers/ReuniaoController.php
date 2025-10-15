<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reuniao;
use App\Models\ReuniaoParticipante;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReuniaoController extends Controller
{
    /**
     * Helper: extrai CPF do atributo injetado por middleware, do header X-CPF
     * ou de query/body. Sempre retorna apenas dígitos (11) ou null.
     */
    private function getCpfFromRequest(Request $req): ?string
    {
        $raw = $req->attributes->get('cpf_participante')
            ?? $req->header('X-CPF')
            ?? $req->input('cpf')
            ?? null;

        if (!$raw) return null;

        $cpf = preg_replace('/\D+/', '', (string) $raw);
        return $cpf ?: null;
    }

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
            ->orderBy('data')
            ->orderBy('hora');

        return $q->paginate($req->integer('per_page', 10));
    }

    /**
     * GET /api/reunioes/stats  -> protegida (auth:sanctum)
     */
    public function stats(Request $req)
    {
        return $this->computeStats();
    }

    /**
     * GET /api/public/reunioes/stats -> pública (sem login)
     * Mantém o mesmo shape de resposta da protegida.
     */
    public function statsPublic(Request $req)
    {
        return $this->computeStats();
    }

    /**
     * Implementação única para calcular as estatísticas (cards)
     * - Detecta coluna de data existente (inicio | data_hora | data)
     * - Se houver par (data, hora), usa TIMESTAMP(data,hora) para 48h
     * - Retorna chaves planas compatíveis com o frontend
     */
    private function computeStats()
    {
        try {
            $tz  = 'America/Sao_Paulo';
            $now = Carbon::now($tz);
            $end48 = $now->copy()->addHours(48);

            // Detecta a melhor estratégia de data/hora
            $schema = DB::getSchemaBuilder();
            $hasInicio   = $schema->hasColumn('reunioes', 'inicio');      // datetime
            $hasDataHora = $schema->hasColumn('reunioes', 'data_hora');   // datetime
            $hasData     = $schema->hasColumn('reunioes', 'data');        // date
            $hasHora     = $schema->hasColumn('reunioes', 'hora');        // time

            // total
            $total = DB::table('reunioes')->count();

            // hoje / amanha por WHERE DATE(...)
            $hojeCount = 0;
            $amanhaCount = 0;

            if ($hasInicio) {
                $hojeCount   = DB::table('reunioes')->whereDate('inicio', $now->toDateString())->count();
                $amanhaCount = DB::table('reunioes')->whereDate('inicio', $now->copy()->addDay()->toDateString())->count();
            } elseif ($hasDataHora) {
                $hojeCount   = DB::table('reunioes')->whereDate('data_hora', $now->toDateString())->count();
                $amanhaCount = DB::table('reunioes')->whereDate('data_hora', $now->copy()->addDay()->toDateString())->count();
            } elseif ($hasData) {
                $hojeCount   = DB::table('reunioes')->whereDate('data', $now->toDateString())->count();
                $amanhaCount = DB::table('reunioes')->whereDate('data', $now->copy()->addDay()->toDateString())->count();
            } else {
                throw new \RuntimeException("Não encontrei coluna de data em 'reunioes' (tentado: inicio, data_hora, data).");
            }

            // próximas 48h
            if ($hasInicio) {
                $prox48h = DB::table('reunioes')
                    ->whereBetween('inicio', [$now->toDateTimeString(), $end48->toDateTimeString()])
                    ->count();
            } elseif ($hasDataHora) {
                $prox48h = DB::table('reunioes')
                    ->whereBetween('data_hora', [$now->toDateTimeString(), $end48->toDateTimeString()])
                    ->count();
            } elseif ($hasData && $hasHora) {
                // Combina data + hora
                $prox48h = DB::table('reunioes')
                    ->whereBetween(
                        DB::raw("TIMESTAMP(`data`, COALESCE(`hora`, '00:00:00'))"),
                        [$now->toDateTimeString(), $end48->toDateTimeString()]
                    )
                    ->count();
            } elseif ($hasData) {
                // Só data disponível -> aproximação usando 00:00
                $prox48h = DB::table('reunioes')
                    ->whereBetween('data', [$now->toDateString(), $end48->toDateString()])
                    ->count();
            } else {
                // não deve chegar aqui por causa do throw anterior
                $prox48h = 0;
            }

            return response()->json([
                'total'        => $total,
                'hoje'         => $hojeCount,
                'amanha'       => $amanhaCount,
                'proximas_48h' => $prox48h, // chave que alguns componentes usam
                'prox_48h'     => $prox48h, // compat com outros
                'ref' => [
                    'tz'      => $tz,
                    'agora'   => $now->toDateTimeString(),
                    'ate_48h' => $end48->toDateTimeString(),
                ],
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Erro em /reunioes/stats: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Erro ao calcular estatísticas.',
                'error'   => app()->isProduction() ? null : $e->getMessage(),
            ], 500);
        }
    }

    public function cards()
    {
        return $this->computeStats();
    }

    public function statsPeriodos(Request $req)
    {
        $tz = config('app.timezone', 'America/Sao_Paulo');
        $agora = Carbon::now($tz);

        $iniSemana = (clone $agora)->startOfWeek(Carbon::MONDAY)->toDateString();
        $fimSemana = (clone $agora)->endOfWeek(Carbon::SUNDAY)->toDateString();

        $iniMes = (clone $agora)->startOfMonth()->toDateString();
        $fimMes = (clone $agora)->endOfMonth()->toDateString();

        $iniAno = (clone $agora)->startOfYear()->toDateString();
        $fimAno = (clone $agora)->endOfYear()->toDateString();

        $contagens = [
            'semana' => Reuniao::whereBetween('data', [$iniSemana, $fimSemana])->count(),
            'mes'    => Reuniao::whereBetween('data', [$iniMes, $fimMes])->count(),
            'ano'    => Reuniao::whereBetween('data', [$iniAno, $fimAno])->count(),
        ];

        // Semana por dia (seg a dom)
        $semanaPorDia = [];
        for ($i = 0; $i < 7; $i++) {
            $d = Carbon::parse($iniSemana, $tz)->addDays($i);
            $semanaPorDia[] = [
                'dia'   => $d->isoFormat('dd D/M'),
                'total' => Reuniao::whereDate('data', $d->toDateString())->count(),
            ];
        }

        // Mês por dia
        $mesPorDia = [];
        $diasNoMes = $agora->daysInMonth;
        for ($i = 0; $i < $diasNoMes; $i++) {
            $d = Carbon::parse($iniMes, $tz)->addDays($i);
            $mesPorDia[] = [
                'dia'   => $d->format('d/m'),
                'total' => Reuniao::whereDate('data', $d->toDateString())->count(),
            ];
        }

        // Ano por mês
        $anoPorMes = [];
        for ($m = 1; $m <= 12; $m++) {
            $start = Carbon::create($agora->year, $m, 1, 0, 0, 0, $tz);
            $end   = (clone $start)->endOfMonth();
            $anoPorMes[] = [
                'mes'   => $start->format('m/Y'),
                'total' => Reuniao::whereBetween('data', [$start->toDateString(), $end->toDateString()])->count(),
            ];
        }

        return response()->json([
            'contagens' => $contagens,
            'series' => [
                'semana_por_dia' => $semanaPorDia,
                'mes_por_dia'    => $mesPorDia,
                'ano_por_mes'    => $anoPorMes,
            ],
            'ref' => [
                'tz'     => $tz,
                'semana' => ['inicio' => $iniSemana, 'fim' => $fimSemana],
                'mes'    => ['inicio' => $iniMes, 'fim' => $fimMes],
                'ano'    => ['inicio' => $iniAno, 'fim' => $fimAno],
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
            // 'participantes.*.telefone' => 'nullable|string|max:30',
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
                // 'telefone'   => $p['telefone'] ?? null,
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
            // 'participantes.*.telefone' => 'nullable|string|max:30',
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
                    // 'telefone'   => $p['telefone'] ?? null,
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

    // GET /api/participante/reunioes  (header X-CPF | query/body cpf)
    public function participantIndex(Request $req)
    {
        $cpfDigits = $this->getCpfFromRequest($req);
        if (!$cpfDigits) {
            return response()->json(['message' => 'CPF obrigatório'], 400);
        }
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

    // GET /api/participante/reunioes/{id}  (header X-CPF | query/body cpf)
    public function participantShow(Request $req, $id)
    {
        $cpfDigits = $this->getCpfFromRequest($req);
        if (!$cpfDigits) {
            return response()->json(['message' => 'CPF obrigatório'], 400);
        }
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
     * GET /api/reunioes/{id}/participantes-by-cpf
     * Retorna os participantes da reunião SOMENTE se o CPF informado participa dela.
     * Não expõe CPFs dos demais participantes.
     */
    public function participantesByCpf($id, Request $request)
    {
        $cpfDigits = $this->getCpfFromRequest($request);
        if (!$cpfDigits) {
            return response()->json(['message' => 'CPF obrigatório'], Response::HTTP_BAD_REQUEST);
        }
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
        }])->findOrFail($id);

        return response()->json([
            'participantes' => $reuniao->participantes,
            'reuniao_id'    => $reuniao->id,
        ], Response::HTTP_OK);
    }

    public function checkCpf(Request $req)
    {
        $cpf = preg_replace('/\D/', '', (string) $req->input('cpf'));

        if (!$this->cpfValido($cpf)) {
            return response()->json(['ok' => false, 'reason' => 'invalid_format'], 422);
        }

        // existe em ao menos uma reunião?
        $exists = ReuniaoParticipante::where('cpf', $cpf)->exists();

        // (opcional) traga algumas reuniões para feedback amigável
        $reunioes = [];
        if ($exists) {
            $reunioes = Reuniao::whereHas('participantes', fn($q) => $q->where('cpf', $cpf))
                ->orderBy('data', 'desc')
                ->limit(3)
                ->get(['id', 'titulo', 'data']);
        }

        return response()->json([
            'ok'       => true,
            'exists'   => $exists,
            'reunioes' => $reunioes,
        ]);
    }

    /** Validação de CPF (dígitos verificadores) */
    private function cpfValido(?string $cpf): bool
    {
        $cpf = preg_replace('/\D/', '', (string) $cpf);
        if (strlen($cpf) !== 11) return false;
        if (preg_match('/^(\d)\1{10}$/', $cpf)) return false;

        $sum = 0;
        for ($i = 0, $w = 10; $i < 9; $i++, $w--) $sum += (int)$cpf[$i] * $w;
        $r = ($sum * 10) % 11;
        if ($r == 10) $r = 0;
        if ($r != (int)$cpf[9]) return false;

        $sum = 0;
        for ($i = 0, $w = 11; $i < 10; $i++, $w--) $sum += (int)$cpf[$i] * $w;
        $r = ($sum * 10) % 11;
        if ($r == 10) $r = 0;
        if ($r != (int)$cpf[10]) return false;

        return true;
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
