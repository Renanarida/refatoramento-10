<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ReuniaoParticipante;

class IdentificarParticipantePorCpf {

    public function handle(Request $request, Closure $next)
    {
        $cpf = $request->header('X-CPF') ?? $request->query('cpf');
        if ($cpf) {
            $cpf = preg_replace('/\D+/', '', $cpf); // só dígitos
            $request->attributes->set('cpf_participante', $cpf);
        }
        return $next($request);
    }
}
