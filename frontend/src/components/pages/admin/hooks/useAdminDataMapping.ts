import type { User, Product, Report, CancelRequest, Withdrawal, Order, Category } from "@/lib/mock-data";
import type { Faculty } from "../admin-dashboard.shared";

export function useAdminDataMapping() {
  const mapUser = (user: any): User =>
    ({
      id: user.id?.toString() || user.uuid || user.id,
      uuid: user.id || user.uuid || "",
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
      faculty: user.faculty || user.facultyDetails?.id || "",
      role: user.role || "student",
      isBanned: user.isBanned || false,
      isVerified: user.isVerified || false,
      isWarned: user.isWarned || user.is_warned || false,
      warningReason: user.warningReason || user.warning_reason || "",
      warningCount: user.warningCount || user.warning_count || 0,
      joinedAt: user.joinedAt || user.created_at || new Date().toISOString(),
      createdAt: user.joinedAt || user.created_at || new Date().toISOString(),
      banReason: user.banReason || "",
    }) as unknown as User;

  const mapUsers = (data: any[]): User[] => data.map((user) => mapUser(user));

  const mapProduct = (product: any): Product =>
    ({
      id: product.id?.toString() || product.uuid || "",
      title: product.title || "",
      slug: product.slug || "",
      type: product.type || "barang",
      price: product.price || 0,
      priceMin: product.price_min || product.priceMin || 0,
      priceMax: product.price_max || product.priceMax || 0,
      priceType: product.price_type || product.priceType || "fixed",
      category: typeof product.category === "string" ? product.category : (product.category?.name || product.category_name || ""),
      categoryId:
        product.categoryId || product.category?.uuid || product.category_id?.toString() || "",
      description: product.description || "",
      condition: product.condition || "baru",
      stock: product.stock || 0,
      location: product.location || "",
      canNego: product.can_nego || false,
      seller: {
        id:
          product.seller?.id ||
          product.seller?.uuid ||
          product.seller_id?.toString() ||
          "",
        name: product.seller?.name || product.seller_name || "",
        avatar: product.seller?.avatar || product.seller_avatar || "",
      },
      images: product.images || [],
      isActive: product.status === "active" || product.is_active || false,
      status: product.status || (product.is_active ? "active" : "inactive"),
      soldCount: product.soldCount || product.sold_count || 0,
      durationMin: product.durationMin || product.duration_min || undefined,
      durationMax: product.durationMax || product.duration_max || undefined,
      durationUnit: product.durationUnit || product.duration_unit || undefined,
      createdAt: product.created_at || new Date().toISOString(),
      deletedAt: product.deleted_at || product.deletedAt || undefined,
      deletedBy: product.deleted_by || product.deletedBy || undefined,
    }) as unknown as Product;

  const mapProducts = (data: any[]): Product[] =>
    data.map((product) => mapProduct(product));

  const mapCategoriesToState = (data: any[]) => {
    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#6b7280"];
    const mapped = data.map((cat: any) => ({
      id: cat.id?.toString() || cat.slug,
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      description: cat.description,
      sortOrder: cat.sort_order || cat.sortOrder || 0,
      isActive: cat.is_active !== undefined ? cat.is_active : cat.isActive,
      productCount: cat.product_count || cat.productCount || 0,
      createdAt: cat.created_at || cat.createdAt,
    }));
    const charts = mapped.map((cat: any, idx: number) => ({
      name: cat.name,
      value: cat.productCount || 0,
      fill: colors[idx % colors.length],
    }));
    return { mapped, charts };
  };

  const mapCategory = (cat: any): Category => ({
    id: cat.id?.toString() || cat.slug,
    name: cat.name,
    slug: cat.slug,
    type: cat.type,
    description: cat.description,
    sortOrder: cat.sort_order || cat.sortOrder || 0,
    isActive: cat.is_active !== undefined ? cat.is_active : cat.isActive,
    productCount: cat.product_count || cat.productCount || 0,
    createdAt: cat.created_at || cat.createdAt || new Date().toISOString(),
  }) as Category;

  const mapFaculty = (faculty: any): Faculty => ({
    id: faculty.id?.toString() || faculty.code,
    code: faculty.code,
    name: faculty.name,
    description: faculty.description || "",
    sortOrder: faculty.sort_order || faculty.sortOrder || 0,
    isActive: faculty.is_active !== undefined ? faculty.is_active : faculty.isActive,
  }) as Faculty;

  const mapReports = (data: any[]): Report[] =>
    data.map(
      (report) =>
        ({
          id: report.id?.toString() || "",
          reportNumber: report.reportNumber || `RPT-${report.id}`,
          reason: report.reason || "",
          description: report.description || "",
          status: report.status || "pending",
          priority: report.priority || "normal",
          reporter: report.reporter
            ? {
                id: report.reporter.id?.toString() || report.reporter.uuid || "",
                name: report.reporter.name || "Unknown",
                email: report.reporter.email || "",
              }
            : {
                id: report.reporter_id?.toString() || "",
                name: report.reporter_name || "Unknown",
                email: "",
              },
          reportedUser: report.reportedUser
            ? {
                id: report.reportedUser.id?.toString() || report.reportedUser.uuid || "",
                name: report.reportedUser.name || "Unknown",
                email: report.reportedUser.email || "",
                warningCount: report.reportedUser.warningCount || report.reportedUser.warning_count || 0,
                isBanned: report.reportedUser.isBanned || report.reportedUser.is_banned || false,
              }
            : {
                id: report.reported_user_id?.toString() || "",
                name: report.reported_user_name || "Unknown",
                email: "",
              },
          productId: report.productId || report.product_id || "",
          productTitle: report.productTitle || "",
          chatId: report.chatId || report.chat_id || "",
          chatMessage: report.chatMessage || "",
          chatAttachments: report.chatAttachments || [],
          reportType: report.reportType || "user",
          createdAt: report.createdAt || report.created_at || new Date().toISOString(),
        }) as unknown as Report,
    );

  const mapCancelRequest = (request: any): CancelRequest => {
    const requester = request.requester
      ? mapUser(request.requester)
      : ({
          id: request.requester_id?.toString() || request.requesterId || "",
          name: request.requester_name || "Unknown",
          email: "",
          phone: "",
          avatar: "",
          faculty: null,
          isVerified: false,
          joinedAt: request.createdAt || new Date().toISOString(),
        } as User);

    return {
      id: request.id || request.uuid || "",
      requestNumber: request.requestNumber || request.request_number || "",
      orderId:
        request.orderId ||
        request.order_id ||
        request.order?.id ||
        request.order?.uuid ||
        "",
      order: request.order
        ? {
            ...request.order,
            buyer: request.order.buyer ? mapUser(request.order.buyer) : undefined,
            seller: request.order.seller ? mapUser(request.order.seller) : undefined,
          }
        : undefined,
      requester,
      reason: request.reason || "other",
      description: request.description || "",
      status: request.status || "pending",
      adminNotes: request.adminNotes || request.admin_notes || undefined,
      rejectionReason:
        request.rejectionReason || request.rejection_reason || undefined,
      refundAmount: request.refundAmount ?? request.refund_amount ?? 0,
      refundProcessed:
        request.refundProcessed ?? request.refund_processed ?? false,
      createdAt:
        request.createdAt || request.created_at || new Date().toISOString(),
      reviewedAt: request.reviewedAt || request.reviewed_at || undefined,
      refundedAt: request.refundedAt || request.refunded_at || undefined,
    } as CancelRequest;
  };

  const mapWithdrawals = (data: any[]): Withdrawal[] =>
    data.map(
      (withdrawal) =>
        ({
          id: withdrawal.id?.toString() || "",
          withdrawalNumber:
            withdrawal.withdrawalNumber ||
            withdrawal.withdrawal_number ||
            `WD-${withdrawal.id}`,
          user: withdrawal.user
            ? mapUser(withdrawal.user)
            : ({
                id: withdrawal.user_id?.toString() || "",
                name: withdrawal.user_name || "",
              } as User),
          amount: withdrawal.amount || 0,
          totalDeduction:
            withdrawal.totalDeduction || withdrawal.total_deduction || 0,
          bankName: withdrawal.bankName || withdrawal.bank_name || "",
          accountNumber:
            withdrawal.accountNumber || withdrawal.account_number || "",
          accountName: withdrawal.accountName || withdrawal.account_name || "",
          accountType:
            withdrawal.accountType || withdrawal.account_type || "bank",
          status: withdrawal.status || "pending",
          rejectionReason:
            withdrawal.rejectionReason ||
            withdrawal.rejection_reason ||
            undefined,
          failureReason:
            withdrawal.failureReason || withdrawal.failure_reason || undefined,
          createdAt:
            withdrawal.createdAt ||
            withdrawal.created_at ||
            new Date().toISOString(),
          processedAt:
            withdrawal.processedAt || withdrawal.processed_at || undefined,
        }) as unknown as Withdrawal,
    );

  const mapOrders = (data: any[]): Order[] =>
    data.map(
      (order) =>
        ({
          id: order.id || order.uuid || "",
          orderNumber: order.orderNumber || order.order_number || "",
          product: order.product ? mapProduct(order.product) : undefined,
          productTitle: order.productTitle || order.product_title || "",
          productType: order.productType || order.product_type || "barang",
          buyer: order.buyer ? mapUser(order.buyer) : undefined,
          seller: order.seller ? mapUser(order.seller) : undefined,
          status: order.status || "pending",
          quantity: order.quantity || 1,
          basePrice: order.basePrice || order.base_price || 0,
          negoPrice: order.negoPrice ?? order.nego_price ?? undefined,
          finalPrice: order.finalPrice || order.final_price || 0,
          shippingFee: order.shippingFee || order.shipping_fee || 0,
          adminFeePercent:
            order.adminFeePercent || order.admin_fee_percent || 0,
          adminFeeDeducted:
            order.adminFeeDeducted || order.admin_fee_deducted || 0,
          totalPrice: order.totalPrice || order.total_price || 0,
          netIncome: order.netIncome || order.net_income || 0,
          shippingMethod: order.shippingMethod || order.shipping_method || "",
          shippingType: order.shippingType || order.shipping_type || "",
          paymentMethod: order.paymentMethod || order.payment_method || "",
          paymentStatus:
            order.paymentStatus || order.payment_status || "pending",
          createdAt:
            order.createdAt || order.created_at || new Date().toISOString(),
          updatedAt:
            order.updatedAt || order.updated_at || new Date().toISOString(),
          completedAt: order.completedAt || order.completed_at || undefined,
          cancelledAt: order.cancelledAt || order.cancelled_at || undefined,
          cancelReason: order.cancelReason || order.cancel_reason || undefined,
        }) as unknown as Order,
    );

  return {
    mapUser,
    mapUsers,
    mapProduct,
    mapProducts,
    mapCategoriesToState,
    mapReports,
    mapCancelRequest,
    mapWithdrawals,
    mapOrders,
    mapCategory,
    mapFaculty,
  };
}
