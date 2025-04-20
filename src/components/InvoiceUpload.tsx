import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface InvoiceUploadProps {
  paymentId: string;
  onUploadComplete: () => void;
  onError: (error: string) => void;
}

const InvoiceUpload: React.FC<InvoiceUploadProps> = ({
  paymentId,
  onUploadComplete,
  onError,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!supabase) return;

    setUploading(true);
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Create a file path using just the payment ID and timestamp for now
      const fileName = `temp/${paymentId}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // First create the NotaFiscal record
      const { data: nfData, error: nfError } = await supabase
        .from('NotaFiscal')
        .insert([
          {
            arquivo_path: fileName,
            data_emissao: new Date().toISOString().split('T')[0],
            status_validacao: 'Pendente',
            created_by: user.id
          },
        ])
        .select('id')
        .single();

      if (nfError) throw nfError;

      // Then update the Pagamento record with the nf_id
      const { error: updateError } = await supabase
        .from('Pagamento')
        .update({ nf_id: nfData.id })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      onUploadComplete();
      // Force page reload to update UI
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading invoice:', error);
      onError('Falha ao fazer upload da nota fiscal. Por favor, tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        onError('Por favor, selecione um arquivo PDF.');
        return;
      }
      handleUpload(file);
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        id={`invoice-upload-${paymentId}`}
        disabled={uploading}
      />
      <label
        htmlFor={`invoice-upload-${paymentId}`}
        className={`cursor-pointer text-blue-600 hover:text-blue-800 flex items-center ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-1" />
            Anexar NF
          </>
        )}
      </label>
    </div>
  );
};

export default InvoiceUpload; 