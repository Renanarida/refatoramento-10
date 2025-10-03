<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReuniaoController;

/*
|--------------------------------------------------------------------------
| API Routes (prefix automático /api)
|--------------------------------------------------------------------------
*/

// ---------- AUTENTICAÇÃO & USUÁRIOS (públicas) ----------
Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store'); // cadastro
Route::post('/login', [AuthController::class, 'login']);                               // login

// ✅✅✅ CHECK CPF (PÚBLICA | fora de auth:sanctum e fora de cpf.participant)
Route::post('/participante/check-cpf', [ReuniaoController::class, 'checkCpf'])
    ->middleware('throttle:20,1'); // evita brute force

// ---------- PÚBLICO (sem login, sem CPF) ----------
Route::get('/public/reunioes', [ReuniaoController::class, 'publicIndex']); // <- fora do cpf.participant

// ---------- PARTICIPANTE (sem login, mas requer CPF) ----------
Route::middleware('cpf.participant')->group(function () {
    // Participante via CPF (header X-CPF OU query ?cpf=)
    Route::get('/reunioes/{id}/participantes-by-cpf', [ReuniaoController::class, 'participantesByCpf']);

    Route::get('/participante/reunioes', [ReuniaoController::class, 'participantIndex']);
    Route::get('/participante/reunioes/{id}', [ReuniaoController::class, 'participantShow']);
});

// ---------- ROTAS PROTEGIDAS (require auth:sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {

    // sessão
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // perfil: upload de avatar
    Route::post('/me/avatar', function (Request $request) {
        $request->validate([
            'avatar' => ['required','image','mimes:png,jpg,jpeg,webp','max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->avatar_path = $path;
        $user->save();

        return response()->json([
            'message'    => 'Avatar atualizado com sucesso!',
            'avatar_url' => asset('storage/'.$path),
        ]);
    });

    // ---------- REUNIÕES ----------
    Route::prefix('reunioes')->group(function () {
        // leitura
        Route::get('/', [ReuniaoController::class, 'index']);              // GET /api/reunioes
        Route::get('/stats', [ReuniaoController::class, 'stats']);         // GET /api/reunioes/stats
        Route::get('/stats-periodos', [ReuniaoController::class, 'statsPeriodos']); // GET /api/reunioes/stats-periodos
        Route::get('/cards', [ReuniaoController::class, 'cards']);         // GET /api/reunioes/cards

        // 🔚 deixa por último para não capturar "stats-periodos"
        Route::get('/{reuniao}', [ReuniaoController::class, 'show']);

        // escrita (ADMIN)
        Route::middleware('role:admin')->group(function () {
            Route::post('/', [ReuniaoController::class, 'store']);
            Route::put('/{reuniao}', [ReuniaoController::class, 'update']);
            Route::delete('/{reuniao}', [ReuniaoController::class, 'destroy']);
        });
    });
});
