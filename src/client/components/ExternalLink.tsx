import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  url: string;
  children: ReactNode;
};

// 外部サイト（特に PDF）に飛ぶ前に確認ダイアログを出すリンク。
// HTML5 標準の <dialog> 要素を使うことで、フォーカストラップ・ESC キー・背景クリック
// 閉じる等の挙動を最小コードで実装している。
export function ExternalLink({ url, children }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleConfirm = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <>
      <button
        type="button"
        className="external-link-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {children}
        <span className="external-link-icon" aria-hidden="true">↗</span>
      </button>
      <dialog
        ref={dialogRef}
        className="external-link-dialog"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // 背景クリックで閉じる（dialog 自身がクリックターゲットの時）
          if (e.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="dialog-content">
          <h3>外部サイトに移動します</h3>
          <div className="dialog-target">
            <div className="dialog-label">リンク先</div>
            <div className="dialog-text">{children}</div>
            <div className="dialog-url">{url}</div>
          </div>
          <p className="dialog-warning">
            {isPdf
              ? '⚠ このリンクは外部サイトの PDF ファイルです。新しいタブで開きます。'
              : '⚠ このリンクは外部サイトに移動します。新しいタブで開きます。'}
          </p>
          <div className="dialog-actions">
            <button type="button" onClick={() => setOpen(false)} className="dialog-cancel">
              キャンセル
            </button>
            <button type="button" onClick={handleConfirm} className="dialog-confirm">
              開く
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
