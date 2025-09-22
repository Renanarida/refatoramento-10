<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 422);
        }

        // Autentica na sessão (cookie) — sem redirect
        Auth::login($user, true);

        // IMPORTANTE: retornar JSON 200, nada de redirect aqui
        return response()->json([
            'message' => 'ok',
            'user'    => $user->only(['id','name','email']),
        ], 200);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()?->only(['id','name','email']));
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'logged out']);
    }
}
