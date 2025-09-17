<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reuniao extends Model
{
    protected $table = 'reunioes';

    protected $fillable = [
        'user_id','titulo','descricao','inicio','fim','local'
    ];

    protected $casts = [
        'inicio' => 'datetime',
        'fim'    => 'datetime',
    ];

    public function dono()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function participantes()
    {
        return $this->belongsToMany(\App\Models\User::class, 'reuniao_user')
                    ->withTimestamps();
    }
}
