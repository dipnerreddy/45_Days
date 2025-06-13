// components/certificate/CertificateDisplay.tsx
"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Flame, Download, Share2, ArrowLeft, CheckCircle, Linkedin, MessageCircle } from 'lucide-react';

type CertificateData = {
  name: string;
  routine: string;
  completionDate: string;
  credentialUrl: string;
  credentialId: string; // Type now includes credentialId
};

export default function CertificateDisplay({ data }: CertificateData) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleDownloadPdf = () => {
    if (!certificateRef.current) return;
    html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: null }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`45-Day-Challenge-Certificate-${data.name}.pdf`);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.credentialUrl);
    toast({ title: "Credential URL Copied!" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4 text-gray-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div ref={certificateRef} className="relative aspect-[1.414/1] w-full flex bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="w-24 bg-primary flex flex-col items-center justify-between p-6">
            <Flame className="h-12 w-12 text-white" />
            <p className="transform rotate-180 text-white font-semibold tracking-widest [writing-mode:vertical-rl]">
              45-DAY CHALLENGE
            </p>
          </div>
          <div className="flex-1 p-12 flex flex-col">
            <div>
              <p className="text-sm font-semibold text-gray-400 tracking-widest">CERTIFICATE OF ACHIEVEMENT</p>
              <h1 className="text-2xl font-bold text-gray-800">Official Completion Record</h1>
            </div>
            <div className="flex-grow" />
            <div>
              <p className="text-lg text-gray-500">This certificate is proudly presented to</p>
              <p className="text-7xl font-black text-gray-900 leading-tight">
                {data.name}
              </p>
              <p className="text-lg text-gray-600 pt-2">
                For the successful completion of the 
                <span className="font-bold"> 45-Day Fitness Challenge </span> 
                on the <span className="font-bold">{data.routine} Routine</span>.
              </p>
            </div>
            <div className="flex-grow" />
            <div className="flex justify-between items-end border-t pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-bold">{data.completionDate}</p>
                  <p className="text-sm text-gray-500">Date of Completion</p>
                </div>
              </div>
              {/* ✅ THE FIX: Display both the ID and the URL */}
              <div className="text-right text-xs text-gray-400">
                <p>Credential ID: {data.credentialId}</p>
                <p>Credential URL: {data.credentialUrl}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadPdf} size="lg" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Achievement</DialogTitle>
                <DialogDescription>Use the Credential URL to add this certificate to your LinkedIn profile or other platforms.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="credentialUrl">Credential URL</Label>
                  <div className="flex items-center gap-2">
                    <Input id="credentialUrl" value={data.credentialUrl} readOnly />
                    <Button onClick={copyToClipboard}>Copy</Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.credentialUrl)}`} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full"><Linkedin className="mr-2 h-4 w-4" /> Share on LinkedIn</Button>
                  </a>
                   <a href={`https://api.whatsapp.com/send?text=I%20just%20completed%20the%2045-Day%20Fitness%20Challenge!%20Check%20out%20my%20certificate:%20${encodeURIComponent(data.credentialUrl)}`} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full"><MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp</Button>
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}