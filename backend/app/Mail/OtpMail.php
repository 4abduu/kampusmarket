<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $recipientName;
    public string $type; // 'email_verification', 'forgot_password', or 'forgot_pin'
    public int $validityMinutes;

    /**
     * Create a new message instance.
     * 
     * @param string $otp The OTP code
     * @param string $recipientName The recipient's name
     * @param string $type Type of OTP: 'email_verification', 'forgot_password', or 'forgot_pin'
     * @param int $validityMinutes OTP validity in minutes (default 10)
     */
    public function __construct(string $otp, string $recipientName, string $type = 'forgot_password', int $validityMinutes = 10)
    {
        $this->otp = $otp;
        $this->recipientName = $recipientName;
        $this->type = $type;
        $this->validityMinutes = $validityMinutes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjects = [
            'email_verification' => 'Verifikasi Email - KampusMarket',
            'forgot_password' => 'Reset Password - KampusMarket',
            'forgot_pin' => 'Reset PIN Wallet - KampusMarket',
        ];
        
        $subject = $subjects[$this->type] ?? 'Verifikasi - KampusMarket';
            
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.otp',
            with: [
                'otp' => $this->otp,
                'recipientName' => $this->recipientName,
                'type' => $this->type,
                'validityMinutes' => $this->validityMinutes,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
