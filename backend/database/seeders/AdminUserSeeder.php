<?php
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder {
    public function run(): void {
        User::firstOrCreate(
            ['email' => 'admin@site.com'],
            ['name' => 'Admin', 'password' => Hash::make('senha123'), 'role' => 'admin']
    );
    }
}