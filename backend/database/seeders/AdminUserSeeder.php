<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@empresa.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('senha123'), // 👈 você pode trocar
                'role' => 'admin',
                'avatar_path' => null,
            ]
        );
    }
}