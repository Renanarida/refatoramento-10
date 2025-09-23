<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Os atributos que podem ser preenchidos em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_path', // 👈 adicionado
    ];

    /**
     * Os atributos que devem ser escondidos para serialização.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Os atributos que devem ser adicionados ao JSON de retorno.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'avatar_url', // 👈 adicionado
    ];

    /**
     * Accessor para retornar a URL pública do avatar.
     *
     * @return string|null
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar_path) {
            return null;
        }

        // gera a URL pública usando o storage
        return asset('storage/' . $this->avatar_path);
    }
}
