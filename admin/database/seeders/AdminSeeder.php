<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::factory()->create([
            'name' => 'Perfu.me Admin',
            'email' => 'admin@perfu.me',
            'password' => Hash::make('password'),
        ]);

        Admin::factory()->create([
            'name' => 'Super Admin',
            'email' => 'super@perfu.me',
            'password' => Hash::make('password'),
        ]);
    }
}
