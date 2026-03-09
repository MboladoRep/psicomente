'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VERSION_HISTORY, VERSION } from '@/lib/version';
import { Info, History, CheckCircle } from 'lucide-react';

export default function VersionBadge() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowHistory(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Ver historial de versiones"
      >
        <Info className="h-3 w-3" />
        <span>v{VERSION}</span>
      </button>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Historial de Versiones
            </DialogTitle>
            <DialogDescription>
              Registro de cambios y actualizaciones de PsicoMente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {VERSION_HISTORY.map((release, index) => (
              <div
                key={release.version}
                className={`p-3 rounded-lg border ${
                  index === 0
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={index === 0 ? 'default' : 'secondary'}
                      className={index === 0 ? 'bg-purple-600' : ''}
                    >
                      v{release.version}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                        Actual
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {release.date}
                  </span>
                </div>
                <ul className="space-y-1">
                  {release.changes.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowHistory(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
