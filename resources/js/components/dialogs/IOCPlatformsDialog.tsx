import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IOCPlatformsDataTable } from '@/components/ui/data-table/ioc-platforms/ioc-platforms-data-table';
import { IOCPlatformsList } from '@/types';
import axios from 'axios';

interface IOCPlatformsDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function IOCPlatformsDialog({ open, onClose }: IOCPlatformsDialogProps) {
    const [platforms, setPlatforms] = useState<IOCPlatformsList>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && platforms.length === 0) {
            fetchPlatforms();
        }
    }, [open]);

    const fetchPlatforms = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/ioc-platforms');
            setPlatforms(response.data.platforms || []);
        } catch (err) {
            console.error('Failed to fetch IOC platforms:', err);
            setError('Failed to load IOC platforms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchPlatforms();
    };

    return (
        <Dialog open={open} onClose={onClose} size="4xl">
            <DialogTitle>IOC Platforms</DialogTitle>
            <DialogDescription>
                Intergovernmental Oceanographic Commission platforms and initiatives supporting ocean science.
            </DialogDescription>

            <DialogBody>
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-sm text-gray-600">Loading IOC platforms...</div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-12">
                        <div className="text-sm text-red-600 mb-4">{error}</div>
                        <Button onClick={handleRetry} color="blue">
                            Try Again
                        </Button>
                    </div>
                )}

                {!loading && !error && (
                    <IOCPlatformsDataTable platforms={platforms} />
                )}
            </DialogBody>

            <DialogActions>
                <Button color={'firefly'} onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}