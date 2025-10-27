import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@ui/primitives/dialog';
import { Button } from '@ui/primitives/button';
import { OrganizationsDataTable } from '@ui/organisms/data-table/organizations';
import {OrganizationsList } from '@/types';
import axios from 'axios';

interface OrganizationsDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function OrganizationsDialog({ open, onClose }: OrganizationsDialogProps) {
    const [organizations, setOrganizations] = useState<OrganizationsList>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && organizations.length === 0) {
            fetchOrganizations();
        }
    }, [open]);

    const fetchOrganizations = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/organizations');
            setOrganizations(response.data.organizations || []);
        } catch (err) {
            console.error('Failed to fetch organizations:', err);
            setError('Failed to load organizations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchOrganizations();
    };

    return (
        <Dialog open={open} onClose={onClose} size="4xl">
            <DialogTitle>CDF Partners</DialogTitle>
            <DialogDescription>
                Partners supporting capacity development through the Ocean Connector.
            </DialogDescription>

            <DialogBody>
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-sm text-gray-600">Loading organizations...</div>
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
                    <OrganizationsDataTable organizations={organizations} />
                )}
            </DialogBody>

            <DialogActions>
                <Button color={'firefly'} onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
