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
        // mantém simples: o front manda "password"
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        $token = $user->createToken('app-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            // 👇 agora inclui "role" (e o que mais quiser)
            'user'  => $user->only(['id', 'name', 'email', 'role']),
        ], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Inclui 'role' para o front saber se é admin
        return response()->json($user->only(['id', 'name', 'email', 'role']), 200);
    }

    public function logout(Request $request)
    {
        // Invalida o token atual (Sanctum)
        $request->user()?->currentAccessToken()?->delete();

        // Se estiver usando sessão também:
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'logged out'], 200);
    }
}
