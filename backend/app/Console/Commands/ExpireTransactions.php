<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireTransactions extends Command
{
    protected $signature = 'transactions:expire';
    protected $description = 'Expire pending transactions past payment deadline';

    public function handle(): void
    {
        $expired = Transaction::pending()
            ->where('payment_deadline', '<', now())
            ->limit(100)
            ->get();

        $count = 0;

        foreach ($expired as $transaction) {
            DB::transaction(function () use ($transaction) {
                $transaction->update(['status' => Transaction::STATUS_EXPIRED]);
            });
            $count++;
        }

        $this->info("Expired {$count} transactions.");
    }
}
