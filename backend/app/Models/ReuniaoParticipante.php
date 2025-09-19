<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReuniaoParticipante extends Model
{
    protected $table = 'reuniao_participantes';

    protected $fillable = ['reuniao_id', 'nome', 'email', 'papel'];

    public function reuniao()
    {
        return $this->belongsTo(Reuniao::class, 'reuniao_id');
    }
}