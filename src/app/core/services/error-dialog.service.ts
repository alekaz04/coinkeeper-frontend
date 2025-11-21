import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogComponent } from '@shared/components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {
  private dialogRef: MatDialogRef<ErrorDialogComponent> | null = null;

  constructor(private dialog: MatDialog) {}

  /**
   * Показать модалку с ошибкой
   */
  showError(message: string): void {
    // Если диалог уже открыт, закрываем его
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    // Открываем новый диалог
    this.dialogRef = this.dialog.open(ErrorDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: { message },
      disableClose: false,
      panelClass: 'error-dialog-container'
    });

    // Очищаем ссылку после закрытия
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  /**
   * Закрыть текущий диалог
   */
  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}
