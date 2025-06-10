// components/certificate/CertificateDisplay.tsx
"use client";

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Flame, Download, Share2, ArrowLeft, CheckCircle } from 'lucide-react';

type CertificateData = {
  name: string;
  routine: string;
  completionDate: string;
  certificateId: string;
  certificateUrl: string;
  referenceNumber: string;
};

type CertificateDisplayProps = {
  data: CertificateData;
};

export default function CertificateDisplay({ data }: CertificateDisplayProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleDownloadPdf = () => {
    if (!certificateRef.current) return;
    
    // Using a higher scale for better PDF quality
    html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: null }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`45-Day-Challenge-Certificate-${data.name}.pdf`);
    });
  };

  const handleShare = () => {
    const shareUrl = data.certificateUrl;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "A shareable link to your certificate has been copied.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-5xl mx-auto">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4 text-gray-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            
            {/* ==================================================================== */}
            {/* ==================== NEW MODERN CERTIFICATE DESIGN =================== */}
            {/* ==================================================================== */}
            <div 
              ref={certificateRef}
              className="relative aspect-[1.414/1] w-full flex bg-white shadow-2xl rounded-lg overflow-hidden"
            >
              {/* Left Vertical Brand Bar */}
              <div className="w-24 bg-primary flex flex-col items-center justify-between p-6">
                  <Flame className="h-12 w-12 text-white" />
                  <p className="transform rotate-180 text-white font-semibold tracking-widest [writing-mode:vertical-rl]">
                    45-DAY CHALLENGE
                  </p>
              </div>

              {/* Right Main Content Area */}
              <div className="flex-1 p-12 flex flex-col">
                  {/* Header */}
                  <div>
                      <p className="text-sm font-semibold text-gray-400 tracking-widest">CERTIFICATE OF ACHIEVEMENT</p>
                      <h1 className="text-2xl font-bold text-gray-800">Official Completion Record</h1>
                  </div>

                  {/* Spacer */}
                  <div className="flex-grow" />

                  {/* Main Recipient Details */}
                  <div className="space-y-2">
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
                  
                  {/* Spacer */}
                  <div className="flex-grow" />

                  {/* Footer with Date and ID */}
                  <div className="flex justify-between items-end border-t pt-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-bold">{data.completionDate}</p>
                          <p className="text-sm text-gray-500">Date of Completion</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                          <p>{data.certificateId}</p>
                          <p>{data.certificateUrl}</p>
                      </div>
                  </div>
              </div>
            </div>

            {/* Action buttons (unchanged) */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleDownloadPdf} size="lg" className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                <Button onClick={handleShare} size="lg" variant="outline" className="w-full sm:w-auto">
                    <Share2 className="mr-2 h-4 w-4" />
                    Copy Share Link
                </Button>
            </div>
        </div>
    </div>
  );
}