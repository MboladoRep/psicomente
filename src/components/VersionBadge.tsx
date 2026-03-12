'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Check, Sparkles } from 'lucide-react';
import { VERSION, VERSION_HISTORY } from '@/lib/version';

export default function VersionBadge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Badge variant="outline" className="font-mono text-[10px]">
            v{VERSION}
          </Badge>
          <History className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Historial de Versiones
          </DialogTitle>
          <DialogDescription>
            PsicoMente se actualiza constantemente para mejorar tu experiencia.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {VERSION_HISTORY.map((entry, index) => (
              <div
                key={entry.version}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? 'default' : 'secondary'} className="font-mono">
                      v{entry.version}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Actual
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                
                <ul className="space-y-1">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
