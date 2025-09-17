<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function store(Request $request)
   {
    $request->validate([
        'nome'   => ['required','string','min:2'],
        'email'  => ['required','email','unique:users,email'],
        'senha'  => ['required','string','min:6'],
    ]);

    User::create([
        'name'     => $request->input('nome'),
        'email'    => $request->input('email'),
        'password' => Hash::make($request->input('senha')),
    ]);

    return response()->json(['ok' => true]);
   }
}
