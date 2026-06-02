import { useEffect, useState } from "react"
import type { Address as AddressType } from "@/lib/mock-data"
import { userApi } from "@/lib/api/users"
import * as addressApi from "@/lib/api/addresses"

interface DashboardUser {
  id: string
  name: string
  email: string
  phone?: string
  facultyName?: string
  bio?: string
  faculty?: string | null
}

interface UseDashboardSettingsParams {
  currentUser: DashboardUser
  initialAddresses: AddressType[]
}

export function useDashboardSettings({ currentUser, initialAddresses }: UseDashboardSettingsParams) {
  const [addresses, setAddresses] = useState<AddressType[]>(() => initialAddresses)
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [showDeleteAddressDialog, setShowDeleteAddressDialog] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: "",
    phone: "",
    address: "",
    notes: "",
    isPrimary: false,
  })
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [addressError, setAddressError] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || "",
    bio: currentUser.bio || "",
    faculty: currentUser.faculty || "",
  })

  // Load addresses from API on mount
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoadingAddresses(true)
        setAddressError(null)
        const response = await addressApi.getAddresses()
        const data = Array.isArray(response?.data) ? response.data : response
        setAddresses(data || [])
      } catch (err) {
        setAddressError(err instanceof Error ? err.message : "Gagal memuat alamat")
        setAddresses([])
      } finally {
        setIsLoadingAddresses(false)
      }
    }

    loadAddresses()
  }, [])

  useEffect(() => {
    setProfileForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || "",
      bio: currentUser.bio || "",
      faculty: currentUser.faculty || "",
    })
  }, [currentUser])

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  const passwordValidations = {
    minLength: passwordForm.newPassword.length >= 8,
    hasNumber: /\d/.test(passwordForm.newPassword),
    hasLowercase: /[a-z]/.test(passwordForm.newPassword),
    hasUppercase: /[A-Z]/.test(passwordForm.newPassword),
  }

  const isPasswordValid = Object.values(passwordValidations).every(Boolean)

  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({ label: "", recipient: "", phone: "", address: "", notes: "", isPrimary: false })
    setShowAddressDialog(true)
  }

  const handleEditAddress = (address: AddressType) => {
    setEditingAddress(address)
    setAddressForm({
      label: address.label,
      recipient: address.recipient,
      phone: address.phone || "",
      address: address.address,
      notes: address.notes || "",
      isPrimary: address.isPrimary,
    })
    setShowAddressDialog(true)
  }

  const handleSaveAddress = async () => {
    try {
      setIsSavingAddress(true)
      setAddressError(null)
      
      if (editingAddress) {
        // Update existing address
        await addressApi.updateAddress(editingAddress.id, {
          label: addressForm.label,
          recipient: addressForm.recipient,
          phone: addressForm.phone,
          address: addressForm.address,
          notes: addressForm.notes,
          is_primary: addressForm.isPrimary,
        })
        
        // If setting as primary, update other addresses
        if (addressForm.isPrimary) {
          setAddresses((previous) =>
            previous.map((address) =>
              address.id === editingAddress.id
                ? { ...address, ...addressForm }
                : { ...address, isPrimary: false }
            )
          )
        } else {
          setAddresses((previous) =>
            previous.map((address) =>
              address.id === editingAddress.id ? { ...address, ...addressForm } : address
            )
          )
        }
      } else {
        // Create new address
        const newAddressData = {
          label: addressForm.label,
          recipient: addressForm.recipient,
          phone: addressForm.phone,
          address: addressForm.address,
          notes: addressForm.notes,
          is_primary: addressForm.isPrimary,
        }
        
        const createdAddress = await addressApi.createAddress(newAddressData)
        
        if (addressForm.isPrimary) {
          setAddresses((previous) => [
            ...previous.map((address) => ({ ...address, isPrimary: false })),
            createdAddress,
          ])
        } else {
          setAddresses((previous) => [...previous, createdAddress])
        }
      }

      setShowAddressDialog(false)
      setEditingAddress(null)
      setAddressForm({ label: "", recipient: "", phone: "", address: "", notes: "", isPrimary: false })
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Gagal menyimpan alamat")
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return

    try {
      setIsSavingAddress(true)
      setAddressError(null)
      await addressApi.deleteAddress(addressToDelete)
      
      setAddresses((previous) => previous.filter((address) => address.id !== addressToDelete))
      setShowDeleteAddressDialog(false)
      setAddressToDelete(null)
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Gagal menghapus alamat")
      setShowDeleteAddressDialog(false)
      setAddressToDelete(null)
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoadingProfile(true)
      setProfileError(null)

      if (!profileForm.faculty) {
        throw new Error("Fakultas wajib dipilih sebelum menyimpan profil")
      }
      
      const updatedUser = await userApi.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio,
        facultyId: profileForm.faculty,
      })

      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: updatedUser,
        }),
      )
      

    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Gagal menyimpan profil")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      setPasswordError("Masukkan password saat ini")
      return
    }
    if (!isPasswordValid) {
      setPasswordError("Password baru belum memenuhi syarat")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok")
      return
    }

    try {
      setIsLoadingPassword(true)
      setPasswordError("")
      
      await userApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      
      setShowPasswordDialog(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setShowPasswordSuccess(true)
      setTimeout(() => setShowPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Gagal mengubah password")
    } finally {
      setIsLoadingPassword(false)
    }
  }

  return {
    addresses,
    editingAddress,
    showAddressDialog,
    setShowAddressDialog,
    showDeleteAddressDialog,
    setShowDeleteAddressDialog,
    addressToDelete,
    setAddressToDelete,
    addressForm,
    setAddressForm,
    profileForm,
    setProfileForm,
    showPasswordDialog,
    setShowPasswordDialog,
    passwordForm,
    setPasswordForm,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordError,
    showPasswordSuccess,
    passwordValidations,
    isPasswordValid,
    handleAddAddress,
    handleEditAddress,
    handleSaveAddress,
    handleDeleteAddress,
    handleSaveProfile,
    handleChangePassword,
    isLoadingAddresses,
    addressError,
    isLoadingProfile,
    profileError,
    isLoadingPassword,
    isSavingAddress,
  }
}
