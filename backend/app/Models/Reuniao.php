<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reuniao extends Model
{
    protected $table = 'reunioes';

    protected $fillable = [
        'user_id', 'titulo', 'descricao', 'data', 'hora', 'local', 'metadados',
    ];

    protected $casts = [
        'data' => 'date',
        'metadados' => 'array',
    ];

    public function participantes()
    {
        return $this->hasMany(ReuniaoParticipante::class, 'reuniao_id');
    }
}