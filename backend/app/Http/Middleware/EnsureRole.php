<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class EnsureRole {
  public function handle(Request $request, Closure $next, string $role) {
    $user = Auth::user();
    if (!$user || $user->role !== $role) {
      return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
  }
}