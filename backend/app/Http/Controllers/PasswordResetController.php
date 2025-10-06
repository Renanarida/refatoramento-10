<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class PasswordResetController extends Controller
{
    // Envia o e-mail com link/token
    public function sendLink(Request $request)
    {
        $request->validate(['email' => ['required','email']]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 200);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    // Faz o reset usando token + email + novas senhas
    public function reset(Request $request)
    {
        $request->validate([
            'token'                 => ['required','string'],
            'email'                 => ['required','email'],
            'password'              => ['required','confirmed','min:6'],
        ]);

        $status = Password::reset(
            $request->only('email','password','password_confirmation','token'),
            function (User $user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 200);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}