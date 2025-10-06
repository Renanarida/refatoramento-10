<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // 🔥 Sobrescreve o link de redefinição de senha
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            // base do seu frontend (defina no .env)
            $frontend = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

            // e-mail do usuário
            $email = urlencode($notifiable->getEmailForPasswordReset());

            // 🔗 monta o link React que você criou: /nova-senha?token=...&email=...
            return "{$frontend}/nova-senha?token={$token}&email={$email}";
        });
    }
}
