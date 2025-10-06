@component('mail::message')
# Redefinição de Senha

Olá {{ $user->name ?? 'usuário' }},

Recebemos uma solicitação para redefinir sua senha no sistema **Reuniões Gazin**.

Clique no botão abaixo para criar uma nova senha:

@component('mail::button', ['url' => $actionUrl])
Redefinir Senha
@endcomponent

Se você não fez esta solicitação, ignore este e-mail.

Atenciosamente,  
**Equipe de T.I. - Gazin**
@endcomponent