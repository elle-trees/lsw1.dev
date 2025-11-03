"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Wrench, Book, Save } from "lucide-react";
import { getDownloadEntries } from "@/lib/db";
import { DownloadEntry } from "@/types/database";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Downloads = () => {
  const [downloadEntries, setDownloadEntries] = useState<DownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDownloadEntries();
        setDownloadEntries(data);
      } catch (error) {
        // Error fetching download entries
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "tools":
        return <Wrench className="h-5 w-5 text-[#cba6f7]" />;
      case "guides":
        return <Book className="h-5 w-5 text-[#cba6f7]" />;
      case "save files":
        return <Save className="h-5 w-5 text-[#cba6f7]" />;
      default:
        return <Download className="h-5 w-5 text-[#cba6f7]" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(240,21%,15%)] to-[hsl(235,19%,13%)] text-[hsl(220,17%,92%)] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Download className="h-8 w-8 text-[#cba6f7]" />
            Downloads & Resources
          </h1>
          <p className="text-[hsl(222,15%,60%)] max-w-2xl mx-auto">
            Find useful tools, guides, and save files to help with your speedrunning journey.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner size="sm" className="py-8" />
        ) : downloadEntries.length === 0 ? (
          <Card className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
            <CardContent className="p-8 text-center">
              <p className="text-[hsl(222,15%,60%)]">No download entries available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {downloadEntries.map((entry) => (
              <Card key={entry.id} className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                {/* CardHeader removed */}
                <CardContent className="pt-6"> {/* Adjusted padding after removing CardHeader */}
                  <CardTitle className="text-lg font-medium flex items-center gap-2 mb-2">
                    {getCategoryIcon(entry.category)}
                    {entry.name}
                  </CardTitle>
                  <p className="text-[hsl(222,15%,60%)] text-sm mb-4">{entry.description}</p>
                  <Button asChild className="bg-[#cba6f7] hover:bg-[#b4a0e2] text-[hsl(240,21%,15%)] font-bold">
                    <a href={entry.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Download / View
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;