import { useEffect, useState } from "react"
import type { Address as AddressType } from "@/lib/mock-data"

interface DashboardUser {
  id: string
  name: string
  email: string
  phone?: string
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

  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || "",
    bio: currentUser.bio || "",
    faculty: currentUser.faculty || "",
  })

  useEffect(() => {
    setProfileForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || "",
      bio: currentUser.bio || "",
      faculty: currentUser.faculty || "",
    })
  }, [currentUser])
  const [showProfileSuccess, setShowProfileSuccess] = useState(false)

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

  const handleSaveAddress = () => {
    if (editingAddress) {
      setAddresses((previous) => previous.map((address) => (
        address.id === editingAddress.id
          ? { ...address, ...addressForm }
          : addressForm.isPrimary ? { ...address, isPrimary: false } : address
      )))
    } else {
      const newAddress: AddressType = {
        id: `addr-${Date.now()}`,
        userId: currentUser.id,
        ...addressForm,
        createdAt: new Date().toISOString(),
      }

      if (addressForm.isPrimary) {
        setAddresses((previous) => [...previous.map((address) => ({ ...address, isPrimary: false })), newAddress])
      } else {
        setAddresses((previous) => [...previous, newAddress])
      }
    }

    setShowAddressDialog(false)
    setEditingAddress(null)
  }

  const handleDeleteAddress = () => {
    if (!addressToDelete) return

    setAddresses((previous) => previous.filter((address) => address.id !== addressToDelete))
    setShowDeleteAddressDialog(false)
    setAddressToDelete(null)
  }

  const handleSaveProfile = () => {
    setShowProfileSuccess(true)
    setTimeout(() => setShowProfileSuccess(false), 3000)
  }

  const handleChangePassword = () => {
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

    setPasswordError("")
    setShowPasswordDialog(false)
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setShowPasswordSuccess(true)
    setTimeout(() => setShowPasswordSuccess(false), 3000)
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
    showProfileSuccess,
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
  }
}
