import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Eye, Ban, UserCheck, Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react";

interface AdminUsersTabProps {
  filteredUsers: Array<any>;
  paginatedUsers: Array<any>;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  showUserFilters: boolean;
  setShowUserFilters: (value: boolean) => void;
  userSearchTerm: string;
  setUserSearchTerm: (value: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (value: any) => void;
  userFacultyFilter: string;
  setUserFacultyFilter: (value: string) => void;
  facultyOptions: Array<{ value: string; label: string }>;
  setUserPage: (value: number) => void;
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => React.ReactNode;
  getInitials: (value?: string | null) => string;
  getFacultyName: (value: string | null) => string;
  handleViewUser: (user: any) => void;
  handleBanUser: (user: any) => void;
  handleUnbanUser: (user: any) => void;
}

export default function AdminUsersTab({
  filteredUsers,
  paginatedUsers,
  totalUsers,
  totalPages,
  currentPage,
  showUserFilters,
  setShowUserFilters,
  userSearchTerm,
  setUserSearchTerm,
  userStatusFilter,
  setUserStatusFilter,
  userFacultyFilter,
  setUserFacultyFilter,
  facultyOptions,
  setUserPage,
  renderPagination,
  getInitials,
  getFacultyName,
  handleViewUser,
  handleBanUser,
  handleUnbanUser,
}: AdminUsersTabProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Manajemen User</CardTitle>
              <CardDescription>Daftar semua user terdaftar (Read & Ban)</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">{totalUsers} user</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Cari nama, email, telepon..." value={userSearchTerm} onChange={(e) => { setUserSearchTerm(e.target.value); setUserPage(1); }} className="pl-9" />
            </div>
            <Select value={userStatusFilter} onValueChange={(value) => { setUserStatusFilter(value); setUserPage(1); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="banned">Diblokir</SelectItem>
                <SelectItem value="warned">Warning</SelectItem>
                <SelectItem value="unverified">Belum Verif</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setShowUserFilters(!showUserFilters)} className="gap-1"><Filter className="h-4 w-4" />Filter{showUserFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            {(userStatusFilter !== "all" || userFacultyFilter !== "all") && <Button variant="ghost" size="sm" onClick={() => { setUserSearchTerm(""); setUserStatusFilter("all"); setUserFacultyFilter("all"); setUserPage(1); }} className="text-xs text-muted-foreground"><X className="h-3 w-3 mr-1" />Reset</Button>}
          </div>
          {showUserFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Select value={userFacultyFilter} onValueChange={(value) => { setUserFacultyFilter(value); setUserPage(1); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Fakultas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Fakultas</SelectItem>
                  {facultyOptions.map((faculty) => (
                    <SelectItem key={faculty.value} value={faculty.value}>
                      {faculty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada user ditemukan dengan filter tersebut</p></div>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-md">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">User</TableHead>
                    <TableHead className="w-[20%]">Email</TableHead>
                    <TableHead className="w-[20%]">Fakultas</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[10%]">Bergabung</TableHead>
                    <TableHead className="w-[5%] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2"><Avatar className="h-8 w-8">{user.avatar && <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />}<AvatarFallback className={`text-xs ${user.isBanned ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700"}`}>{getInitials(user.name)}</AvatarFallback></Avatar><div><p className="font-medium text-sm">{user.name}</p><p className="text-xs text-muted-foreground">{user.phone || "-"}</p></div></div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">{getFacultyName(user.faculty ?? null)}</TableCell>
                      <TableCell>{user.isBanned ? <Badge variant="destructive">Diblokir</Badge> : user.isWarned ? <Badge variant="outline" className="border-amber-500 text-amber-600">Warning</Badge> : user.isVerified ? <Badge variant="default" className="bg-primary-500">Aktif</Badge> : <Badge variant="default" className="bg-secondary text-white hover:bg-secondary/90 border-transparent">Belum Verif</Badge>}</TableCell>
                      <TableCell className="text-sm">{user.joinedAt}</TableCell>
                      <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewUser(user)}><Eye className="h-4 w-4" /></Button>{user.isBanned ? <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-600" onClick={() => handleUnbanUser(user)}><UserCheck className="h-4 w-4" /></Button> : <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleBanUser(user)}><Ban className="h-4 w-4" /></Button>}</div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {renderPagination(currentPage, totalPages, setUserPage)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
