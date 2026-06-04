<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Facades\DB;

class MergeDuplicateChats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:merge-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Menggabungkan room chat yang ganda (duplikat) antara dua user yang sama menjadi satu room.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Mencari room chat yang duplikat...');

        // Get all chats
        $chats = Chat::all();
        
        // Group by user pair (min_id_max_id)
        $grouped = [];
        foreach ($chats as $chat) {
            $minId = min($chat->buyer_id, $chat->seller_id);
            $maxId = max($chat->buyer_id, $chat->seller_id);
            $key = $minId . '_' . $maxId;
            
            if (!isset($grouped[$key])) {
                $grouped[$key] = [];
            }
            $grouped[$key][] = $chat;
        }

        $mergeCount = 0;

        foreach ($grouped as $key => $rooms) {
            if (count($rooms) > 1) {
                // We have duplicates!
                // Sort rooms by created_at to keep the oldest one as primary
                usort($rooms, function($a, $b) {
                    return $a->created_at <=> $b->created_at;
                });

                $primaryRoom = array_shift($rooms);
                $this->info("Ditemukan duplikat untuk pasangan user $key. Room utama yang dipertahankan: {$primaryRoom->id}");

                DB::transaction(function() use ($primaryRoom, $rooms, &$mergeCount) {
                    foreach ($rooms as $duplicate) {
                        // Move messages
                        Message::where('chat_id', $duplicate->id)->update(['chat_id' => $primaryRoom->id]);
                        
                        // Merge unread counts
                        $primaryRoom->buyer_unread += $duplicate->buyer_unread;
                        $primaryRoom->seller_unread += $duplicate->seller_unread;
                        $primaryRoom->save();

                        // Delete duplicate room
                        $duplicate->delete();
                        $mergeCount++;
                    }

                    // Update primary room last message info
                    $latestMessage = Message::where('chat_id', $primaryRoom->id)->latest()->first();
                    if ($latestMessage) {
                        $preview = match ($latestMessage->type->value ?? $latestMessage->type) {
                            'offer' => 'Penawaran harga',
                            'image' => 'Gambar',
                            'file'  => 'File',
                            default => mb_strimwidth($latestMessage->content ?? '', 0, 80, '…'),
                        };

                        $primaryRoom->update([
                            'last_message' => $preview,
                            'last_message_at' => $latestMessage->created_at,
                        ]);
                    }
                });
            }
        }

        $this->info("Berhasil menggabungkan $mergeCount room chat yang ganda.");
    }
}
