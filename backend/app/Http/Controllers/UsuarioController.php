<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function store(Request $request)
    {

        print_r($request->all()); die();

        $validatedData = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'senha' => 'required|string|min:6',
        ]);

        $user = User::create([
            'nome' => $validatedData['nome'],
            'email' => $validatedData['email'],
            'senha' => Hash::make($validatedData['senha']),
        ]);

        return response()->json([
            'message' => 'Usuário criado com sucesso!',
            'user' => $user
        ], 201);
    }
}
