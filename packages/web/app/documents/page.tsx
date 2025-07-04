'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Image, 
  FileImage,
  Download,
  AlertCircle
} from 'lucide-react';

interface ValidationCheck {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

interface ValidationTemplate {
  documentType: string;
  checks: ValidationCheck[];
  instructions?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  student: {
    id: string;
    name: string;
    crefito: string;
  };
  validationChecks?: Record<string, boolean>;
  validationNotes?: string;
  rejectionReason?: string;
  uploadedAt: string;
  validationTemplate?: ValidationTemplate;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [validationChecks, setValidationChecks] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?status=${statusFilter}&limit=50`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedDocument(data.data);
        setValidationChecks(data.data.validationChecks || {});
        setNotes(data.data.validationNotes || '');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const updateValidationChecks = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}/validation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validationChecks, notes }),
      });

      if (response.ok) {
        // Refresh the document list
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error updating validation checks:', error);
    }
  };

  const approveDocument = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setSelectedDocument(null);
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const rejectDocument = async () => {
    if (!selectedDocument || !rejectionReason) return;

    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason, notes }),
      });

      if (response.ok) {
        setSelectedDocument(null);
        setRejectionReason('');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500">Aprovado</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'VACCINATION_CARD':
        return <FileText className="h-4 w-4" />;
      case 'BADGE_PICTURE':
        return <Image className="h-4 w-4" />;
      default:
        return <FileImage className="h-4 w-4" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'VACCINATION_CARD':
        return 'Carteira de Vacinação';
      case 'PROFESSIONAL_ID':
        return 'Identidade Profissional';
      case 'COMMITMENT_CONTRACT':
        return 'Termo de Compromisso';
      case 'ADMISSION_FORM':
        return 'Ficha de Admissão';
      case 'BADGE_PICTURE':
        return 'Foto do Crachá';
      case 'INSURANCE_DOCUMENTATION':
        return 'Documentação de Seguro';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Validação de Documentos</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="APPROVED">Aprovados</SelectItem>
            <SelectItem value="REJECTED">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Documentos ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedDocument?.id === doc.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => fetchDocument(doc.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDocumentIcon(doc.type)}
                        <div>
                          <p className="font-medium text-sm">{doc.student.name}</p>
                          <p className="text-xs text-gray-500">{getDocumentTypeLabel(doc.type)}</p>
                        </div>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Viewer and Validation */}
        <div className="lg:col-span-2">
          {selectedDocument ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Validar Documento</span>
                  {getStatusBadge(selectedDocument.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Estudante:</p>
                    <p>{selectedDocument.student.name}</p>
                    <p className="text-gray-500">CREFITO: {selectedDocument.student.crefito}</p>
                  </div>
                  <div>
                    <p className="font-medium">Tipo:</p>
                    <p>{getDocumentTypeLabel(selectedDocument.type)}</p>
                    <p className="text-gray-500">Enviado em: {new Date(selectedDocument.uploadedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <Separator />

                {/* Document Display */}
                <div>
                  <h3 className="font-medium mb-2">Visualizar Documento</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{selectedDocument.name}</span>
                      <Button variant="outline" size="sm" onClick={() => window.open(selectedDocument.url, '_blank')}>
                        <Download className="h-4 w-4 mr-1" />
                        Abrir
                      </Button>
                    </div>
                    <div className="bg-white border rounded p-4 min-h-64 flex items-center justify-center">
                      {selectedDocument.type === 'BADGE_PICTURE' ? (
                        <img 
                          src={selectedDocument.url} 
                          alt="Document" 
                          className="max-w-full max-h-64 object-contain"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-2" />
                          <p>Clique em "Abrir" para visualizar o documento</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Validation Checks */}
                {selectedDocument.validationTemplate && (
                  <div>
                    <h3 className="font-medium mb-2">Critérios de Validação</h3>
                    {selectedDocument.validationTemplate.instructions && (
                      <p className="text-sm text-gray-600 mb-3">{selectedDocument.validationTemplate.instructions}</p>
                    )}
                    <div className="space-y-2">
                      {selectedDocument.validationTemplate.checks.map((check) => (
                        <div key={check.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={check.id}
                            checked={validationChecks[check.id] || false}
                            onCheckedChange={(checked) => {
                              setValidationChecks(prev => ({
                                ...prev,
                                [check.id]: checked as boolean
                              }));
                            }}
                          />
                          <label htmlFor={check.id} className="text-sm flex items-center">
                            {check.label}
                            {check.required && <AlertCircle className="h-3 w-3 ml-1 text-red-500" />}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Notes */}
                <div>
                  <h3 className="font-medium mb-2">Observações</h3>
                  <Textarea
                    placeholder="Adicione observações sobre a validação..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Rejection Reason */}
                {selectedDocument.status === 'PENDING' && (
                  <div>
                    <h3 className="font-medium mb-2">Motivo da Rejeição</h3>
                    <Textarea
                      placeholder="Motivo da rejeição (obrigatório para rejeitar)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {selectedDocument.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={updateValidationChecks}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Salvar Verificação
                    </Button>
                    <Button 
                      onClick={approveDocument}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={rejectDocument}
                      disabled={!rejectionReason.trim()}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>Selecione um documento para validar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 