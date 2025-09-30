<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IdentificarParticipantePorCpf
{
    public function handle(Request $request, Closure $next)
    {
        // Aceita cabeçalho X-CPF OU query ?cpf=
        $raw = $request->header('X-CPF') ?? $request->query('cpf');

        if (!$raw) {
            return response()->json(['message' => 'CPF obrigatório'], 400);
        }

        // normaliza para só dígitos
        $cpf = preg_replace('/\D+/', '', (string)$raw);

        // validações básicas (tamanho e repetidos)
        if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return response()->json(['message' => 'CPF inválido'], 422);
        }

        // injeta para os controllers
        $request->attributes->set('cpf_participante', $cpf);

        return $next($request);
    }
}
