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
        'cpf',
        'telefone',
        'papel',
    ];

    public $timestamps = true;

    /** Sempre salvar apenas dígitos no CPF */
    public function setCpfAttribute($value): void
    {
        $digits = preg_replace('/\D/', '', (string) $value);
        $this->attributes['cpf'] = $digits ?: null;
    }

    /** Sempre salvar apenas dígitos no telefone */
    public function setTelefoneAttribute($value): void
    {
        $digits = preg_replace('/\D/', '', (string) $value);
        $this->attributes['telefone'] = $digits ?: null;
    }

    public function reuniao()
    {
        return $this->belongsTo(Reuniao::class, 'reuniao_id');
    }
}
