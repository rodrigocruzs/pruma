import React, { useState } from 'react';
import { FileText, Download, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ConfirmationModal from './ConfirmationModal';

interface InvoiceViewProps {
  nfId: string;
  onError: (error: string) => void;
  onRemoveComplete?: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ nfId, onError, onRemoveComplete }) => {
  const [downloading, setDownloading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = async () => {
    if (!supabase) return;

    setDownloading(true);
    try {
      // Get the file path from NotaFiscal table
      const { data: nfData, error: nfError } = await supabase
        .from('NotaFiscal')
        .select('arquivo_path')
        .eq('id', nfId)
        .single();

      if (nfError) throw nfError;

      // Download the file from storage
      const { data: blob, error: downloadError } = await supabase.storage
        .from('invoices')
        .download(nfData.arquivo_path);

      if (downloadError) throw downloadError;
      if (!blob) throw new Error('Arquivo não encontrado.');

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nfData.arquivo_path.split('/').pop() || 'nota-fiscal.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      onError('Falha ao baixar nota fiscal. Por favor, tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!supabase) return;

    setRemoving(true);
    try {
      // Get the file path first
      const { data: nfData, error: nfError } = await supabase
        .from('NotaFiscal')
        .select('arquivo_path')
        .eq('id', nfId)
        .single();

      if (nfError) throw nfError;

      // Remove the file from storage
      const { error: storageError } = await supabase.storage
        .from('invoices')
        .remove([nfData.arquivo_path]);

      if (storageError) throw storageError;

      // Update the payment to remove the nf_id reference
      const { error: updateError } = await supabase
        .from('Pagamento')
        .update({ nf_id: null })
        .eq('nf_id', nfId);

      if (updateError) throw updateError;

      // Delete the NotaFiscal record
      const { error: deleteError } = await supabase
        .from('NotaFiscal')
        .delete()
        .eq('id', nfId);

      if (deleteError) throw deleteError;

      // Close the modal and notify parent of completion
      setIsModalOpen(false);
      if (onRemoveComplete) {
        onRemoveComplete();
      }
    } catch (error: any) {
      console.error('Error removing invoice:', error);
      onError('Falha ao remover nota fiscal. Por favor, tente novamente.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDownload}
          disabled={downloading || removing}
          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
          title="Baixar nota fiscal"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={downloading || removing}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Remover nota fiscal"
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRemoveConfirm}
        title="Remover Nota Fiscal"
        message="Tem certeza que deseja remover a nota fiscal?"
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </>
  );
};

export default InvoiceView; 