<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@legisvault.local',
                'password' => Hash::make('Password123!'),
                'role' => 'admin',
                'avatar' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Legislative Records Officer',
                'email' => 'uploader@legisvault.local',
                'password' => Hash::make('Password123!'),
                'role' => 'uploader',
                'avatar' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'City Council Researcher',
                'email' => 'viewer@legisvault.local',
                'password' => Hash::make('Password123!'),
                'role' => 'viewer',
                'avatar' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
