<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // valida email; senha tratamos manualmente (aceita 'password' OU 'senha')
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $pwd = $request->input('password', $request->input('senha'));
        if (!is_string($pwd) || $pwd === '') {
            return response()->json(['message' => 'Senha é obrigatória.'], 422);
        }

        $user = User::where('email', $request->input('email'))->first();
        if (!$user || !Hash::check($pwd, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        $token = $user->createToken('app-token')->plainTextToken;

        // calcula role + is_admin de forma robusta
        $isAdmin = (bool)($user->is_admin ?? ($user->role === 'admin'));
        $role = $user->role ?? ($isAdmin ? 'admin' : 'user');

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $role,
                'is_admin'   => $isAdmin,
                'avatar_url' => $user->avatar_path ? asset('storage/'.$user->avatar_path) : null,
            ],
        ], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $isAdmin = (bool)($user->is_admin ?? ($user->role === 'admin'));
        $role = $user->role ?? ($isAdmin ? 'admin' : 'user');

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $role,
            'is_admin'   => $isAdmin,
            'avatar_url' => $user->avatar_path ? asset('storage/'.$user->avatar_path) : null,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        // se estiver usando sessão também:
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'logged out'], 200);
    }

    public function updateMe(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Não autenticado'], 401);
    }

    // password é opcional; vazio não altera
    $data = $request->validate([
        'name'     => ['required', 'string', 'max:255'],
        'email'    => [
            'required', 'email', 'max:255',
            Rule::unique('users', 'email')->ignore($user->id),
        ],
        'password' => ['nullable', 'string', 'min:6'],
    ]);

    $user->name  = $data['name'];
    $user->email = $data['email'];

    if (!empty($data['password'])) {
        $user->password = Hash::make($data['password']);
    }

    $user->save();

    return response()->json([
        'message' => 'Perfil atualizado com sucesso.',
        'user' => [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role ?? (($user->is_admin ?? false) ? 'admin' : 'user'),
            'is_admin'   => (bool)($user->is_admin ?? ($user->role === 'admin')),
            'avatar_url' => $user->avatar_path ? asset('storage/'.$user->avatar_path) : null,
        ],
    ], 200);
}
}