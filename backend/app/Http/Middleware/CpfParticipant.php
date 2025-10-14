<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CpfParticipant
{
    public function handle(Request $request, Closure $next)
    {
        $raw = $request->header('X-CPF') ?? $request->input('cpf') ?? $request->query('cpf');
        $cpf = preg_replace('/\D+/', '', (string) $raw);

        if (!$cpf || strlen($cpf) !== 11) {
            return response()->json(['message' => 'CPF obrigatório ou inválido'], 422);
        }

        // injeta para quem quiser usar
        $request->attributes->set('cpf_participante', $cpf);

        return $next($request);
    }
}
