<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReuniaoParticipante extends Model
{
    protected $table = 'reuniao_participantes';

    protected $fillable = [
        'reuniao_id',
        'nome',
        'email',
        'papel',
        'cpf',        // <— importante
        'presenca',
        'observacoes',
    ];

    public $timestamps = true;

    // Sempre salvar apenas dígitos no CPF
    public function setCpfAttribute($value)
    {
        $digits = preg_replace('/\D/', '', (string)$value);
        $this->attributes['cpf'] = $digits ?: null;
    }

    public function reuniao()
    {
        return $this->belongsTo(Reuniao::class, 'reuniao_id');
    }
}
