import { useState, useMemo } from "react";
import { adminAddressesApi, type AdminAddressUser } from "@/lib/api/admin";

interface AddressesProps {
  markResourceLoaded: (key: string) => void;
}

export function useAdminAddresses({ markResourceLoaded }: AddressesProps) {
  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  const [addressesData, setAddressesData] = useState<AdminAddressUser[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  const loadAddressesData = async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const res = await adminAddressesApi.getAddresses();
      if (Array.isArray(res)) {
        setAddressesData(res);
      }
      markResourceLoaded("addresses");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data alamat";
      setAddressesError(msg);
      setAddressesData([]);
      console.error("Failed to load admin addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const filteredAddresses = useMemo<AdminAddressUser[]>(() => {
    if (!addressSearchTerm.trim()) return addressesData;

    const query = addressSearchTerm.toLowerCase().trim();
    return addressesData
      .map((item) => {
        const userMatches =
          item.user.name.toLowerCase().includes(query) ||
          item.user.email.toLowerCase().includes(query);

        const matchingAddresses = item.addresses.filter(
          (addr) =>
            userMatches ||
            addr.label.toLowerCase().includes(query) ||
            addr.recipient_name.toLowerCase().includes(query) ||
            addr.phone.toLowerCase().includes(query) ||
            addr.address.toLowerCase().includes(query) ||
            (addr.note && addr.note.toLowerCase().includes(query)),
        );

        if (matchingAddresses.length > 0) {
          return {
            ...item,
            addresses: matchingAddresses,
          };
        }
        return null;
      })
      .filter((item): item is AdminAddressUser => item !== null);
  }, [addressesData, addressSearchTerm]);

  return {
    addressSearchTerm,
    setAddressSearchTerm,
    addressesData,
    setAddressesData,
    addressesLoading,
    setAddressesLoading,
    addressesError,
    setAddressesError,
    loadAddressesData,
    filteredAddresses,
  };
}
