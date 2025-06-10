// components/certificate/CertificateDisplay.tsx
"use client";

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Award, Download, Share2, ArrowLeft } from 'lucide-react';

type CertificateData = {
  name: string;
  routine: string;
  completionDate: string;
};

type CertificateDisplayProps = {
  data: CertificateData;
  userId: string;
};

export default function CertificateDisplay({ data, userId }: CertificateDisplayProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleDownloadPdf = () => {
    if (!certificateRef.current) return;
    
    html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
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
    // This is the publicly shareable link that will generate the OG image.
    const shareUrl = `${window.location.origin}/share/${userId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "A shareable link to your certificate has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            
            {/* The actual certificate content */}
            <div ref={certificateRef} className="bg-white p-10 border-8 border-primary/80 shadow-2xl aspect-[1.414/1]">
                <div className="w-full h-full border-2 border-primary/50 flex flex-col items-center justify-center text-center space-y-6">
                    <Award className="h-20 w-20 text-primary" />
                    <h1 className="text-xl font-semibold text-gray-600 tracking-widest">CERTIFICATE OF COMPLETION</h1>
                    <p className="text-lg">This certifies that</p>
                    <p className="text-4xl font-bold text-primary">{data.name}</p>
                    <p className="text-lg">has successfully completed the</p>
                    <p className="text-3xl font-semibold">45-Day Fitness Challenge</p>
                    <p className="text-lg">following the <span className="font-bold">{data.routine}</span> routine.</p>
                    <div className="pt-8 text-sm text-gray-500">
                        <p>Issued on: {data.completionDate}</p>
                        <p className="mt-2 font-bold">45-Day Challenge App</p>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleDownloadPdf} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Download as PDF
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full sm:w-auto">
                    <Share2 className="mr-2 h-4 w-4" />
                    Copy Shareable Link
                </Button>
            </div>
        </div>
    </div>
  );
}