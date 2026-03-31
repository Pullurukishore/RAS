import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
// Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
    try {
        const { date } = req.query;
        let whereClause = {};
        let customerWhereClause = {};
        let appointmentWhereClause = {};
        if (date) {
            const dateStr = date;
            const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
            const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
            whereClause = {
                date: { gte: startOfDay, lte: endOfDay }
            };
            customerWhereClause = {
                createdAt: { gte: startOfDay, lte: endOfDay }
            };
            appointmentWhereClause = {
                date: { gte: startOfDay, lte: endOfDay }
            };
        }
        // Invoices with items and payments
        const invoices = await prisma.invoice.findMany({
            where: whereClause,
            include: {
                payments: true,
                items: {
                    include: {
                        service: { select: { description: true, code: true } },
                        product: { select: { description: true, code: true } },
                        package: { select: { description: true, code: true } },
                        membershipPlan: { select: { name: true, code: true } },
                        staff: { select: { id: true, name: true } }
                    }
                },
                customer: { select: { id: true, name: true, phone: true } }
            },
            orderBy: { date: 'desc' }
        });
        const totalInvoices = invoices.length;
        const totalNet = invoices.reduce((sum, inv) => sum + inv.totalNet, 0);
        const totalGross = invoices.reduce((sum, inv) => sum + (inv.totalGross || 0), 0);
        const totalDiscount = invoices.reduce((sum, inv) => sum + (inv.totalDiscount || 0), 0);
        // Total items sold (summing quantities)
        const totalItemsSold = invoices.reduce((sum, inv) => {
            return sum + (inv.items?.reduce((iSum, item) => iSum + (item.quantity || 1), 0) || 0);
        }, 0);
        // New Customers
        const newCustomersCount = await prisma.customer.count({
            where: customerWhereClause
        });
        // Unique customers from invoices
        const uniqueCustomerIds = new Set(invoices.map((inv) => inv.customerId).filter(Boolean));
        // Correct repeat customers calculation
        let repeatCustomersCount;
        if (date) {
            // For a specific date: (Customers who visited today) - (Customers who joined today)
            repeatCustomersCount = Math.max(0, uniqueCustomerIds.size - newCustomersCount);
        }
        else {
            // For Lifetime: Customers who have visit count > 1
            const customerVisitCounts = {};
            invoices.forEach((inv) => {
                if (inv.customerId) {
                    customerVisitCounts[inv.customerId] = (customerVisitCounts[inv.customerId] || 0) + 1;
                }
            });
            repeatCustomersCount = Object.values(customerVisitCounts).filter(count => count > 1).length;
        }
        // Today's appointments
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const appointmentsToday = await prisma.appointment.count({
            where: date ? appointmentWhereClause : {
                date: { gte: todayStart, lte: todayEnd }
            }
        });
        // Payment Methods Aggregation
        const payments = await prisma.payment.findMany({
            where: { invoice: whereClause }
        });
        const paymentMethods = {
            cash: payments.filter((p) => p.method === 'Cash').reduce((s, p) => s + p.amount, 0),
            card: payments.filter((p) => p.method === 'Card').reduce((s, p) => s + p.amount, 0),
            gpay: payments.filter((p) => p.method === 'GPay').reduce((s, p) => s + p.amount, 0),
            paytm: payments.filter((p) => p.method === 'Paytm').reduce((s, p) => s + p.amount, 0),
            phonepe: payments.filter((p) => p.method === 'PhonePe').reduce((s, p) => s + p.amount, 0),
        };
        // Top services by revenue (aggregate from invoice items)
        const serviceRevMap = {};
        invoices.forEach((inv) => {
            inv.items?.forEach((item) => {
                const name = item.service?.description || item.product?.description || item.package?.description || item.membershipPlan?.name;
                if (name) {
                    if (!serviceRevMap[name])
                        serviceRevMap[name] = { name, revenue: 0, count: 0 };
                    serviceRevMap[name].revenue += item.total || 0;
                    serviceRevMap[name].count += (item.quantity || 1);
                }
            });
        });
        const topServices = Object.values(serviceRevMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        // Staff performance
        const staffMap = {};
        invoices.forEach((inv) => {
            inv.items?.forEach((item) => {
                const sid = item.staff?.id;
                const sname = item.staff?.name;
                if (sid && sname) {
                    if (!staffMap[sid])
                        staffMap[sid] = { id: sid, name: sname, revenue: 0, bills: 0 };
                    staffMap[sid].revenue += item.total || 0;
                    staffMap[sid].bills += (item.quantity || 1);
                }
            });
        });
        const staffPerformance = Object.values(staffMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        // Recent invoices (last 5)
        const recentInvoices = invoices.slice(0, 5).map((inv) => ({
            id: inv.id,
            invoiceId: inv.invoiceId,
            customerName: inv.customer?.name || 'Walk-in',
            total: inv.totalNet,
            date: inv.date,
            paymentMethod: inv.payments?.[0]?.method || 'Cash',
            itemCount: inv.items?.length || 0
        }));
        res.json({
            dailySales: totalNet,
            totalGross,
            totalDiscount,
            totalTickets: totalInvoices,
            totalItemsSold,
            newCustomers: newCustomersCount,
            uniqueCustomers: uniqueCustomerIds.size,
            repeatCustomers: repeatCustomersCount,
            appointmentsToday,
            paymentMethods,
            topServices,
            staffPerformance,
            recentInvoices
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Salon Menu with Filtering
app.get('/api/menu', async (req, res) => {
    const { gender, category, subcategory, type } = req.query;
    try {
        let result;
        if (type === 'product') {
            result = await prisma.product.findMany({
                where: {
                    category: category || undefined
                }
            });
        }
        else if (type === 'package') {
            result = await prisma.package.findMany();
        }
        else if (type === 'membership') {
            result = await prisma.membershipPlan.findMany();
        }
        else {
            result = await prisma.service.findMany({
                where: {
                    gender: gender || undefined,
                    category: category || undefined,
                    subcategory: subcategory || undefined
                }
            });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get Single Menu Item
app.get('/api/menu/:id', async (req, res) => {
    const id = req.params.id;
    const type = req.query.type;
    try {
        let result;
        if (type === 'product') {
            result = await prisma.product.findUnique({ where: { id } });
        }
        else if (type === 'package') {
            result = await prisma.package.findUnique({ where: { id } });
        }
        else if (type === 'membership') {
            result = await prisma.membershipPlan.findUnique({ where: { id } });
        }
        else {
            result = await prisma.service.findUnique({ where: { id } });
        }
        if (!result) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add Menu Item
app.post('/api/menu', async (req, res) => {
    const { type, ...data } = req.body;
    try {
        let result;
        const providedData = { ...data };
        let attempts = 3;
        while (attempts > 0) {
            try {
                // Generate a sequential code for new items using the actual max code
                if (type === 'product') {
                    const lastItem = await prisma.product.findFirst({ orderBy: { code: 'desc' } });
                    let nextNum = 1;
                    if (lastItem && lastItem.code.startsWith('PRD-')) {
                        nextNum = (parseInt(lastItem.code.split('-')[1]) || 0) + 1;
                    }
                    providedData.code = `PRD-${nextNum.toString().padStart(4, '0')}`;
                }
                else if (type === 'package') {
                    const lastItem = await prisma.package.findFirst({ orderBy: { code: 'desc' } });
                    let nextNum = 1;
                    if (lastItem && lastItem.code.startsWith('PKG-')) {
                        nextNum = (parseInt(lastItem.code.split('-')[1]) || 0) + 1;
                    }
                    providedData.code = `PKG-${nextNum.toString().padStart(4, '0')}`;
                }
                else {
                    const lastItem = await prisma.service.findFirst({ orderBy: { code: 'desc' } });
                    let nextNum = 1;
                    if (lastItem && lastItem.code.startsWith('SVC-')) {
                        nextNum = (parseInt(lastItem.code.split('-')[1]) || 0) + 1;
                    }
                    providedData.code = `SVC-${nextNum.toString().padStart(4, '0')}`;
                }
                // Sanitize data based on type to prevent Prisma errors
                if (type === 'product') {
                    const { code, description, price, mPrice, category } = providedData;
                    result = await prisma.product.create({
                        data: { code, description, price, mPrice, category }
                    });
                }
                else if (type === 'package') {
                    const { code, description, price, mPrice } = providedData;
                    result = await prisma.package.create({
                        data: { code, description, price, mPrice }
                    });
                }
                else {
                    const { code, description, price, mPrice, gender, category, subcategory } = providedData;
                    result = await prisma.service.create({
                        data: { code, description, price, mPrice, gender, category, subcategory }
                    });
                }
                break; // Break loop on success
            }
            catch (e) {
                if (e.code === 'P2002' && attempts > 1) { // Unique constraint violation, retry code generation
                    attempts--;
                    continue;
                }
                throw e; // Rethrow other errors
            }
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update Menu Item
app.put('/api/menu/:id', async (req, res) => {
    const id = req.params.id;
    const { type, ...data } = req.body;
    try {
        let result;
        const providedData = { ...data };
        // Sanitize data based on type to prevent Prisma errors
        if (type === 'product') {
            const { code, description, price, mPrice, category } = providedData;
            result = await prisma.product.update({
                where: { id },
                data: { code, description, price, mPrice, category }
            });
        }
        else if (type === 'package') {
            const { code, description, price, mPrice } = providedData;
            result = await prisma.package.update({
                where: { id },
                data: { code, description, price, mPrice }
            });
        }
        else {
            const { code, description, price, mPrice, gender, category, subcategory } = providedData;
            result = await prisma.service.update({
                where: { id },
                data: { code, description, price, mPrice, gender, category, subcategory }
            });
        }
        res.json(result);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'An item with this code already exists.' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Delete Menu Item
app.delete('/api/menu/:id', async (req, res) => {
    const id = req.params.id;
    const type = req.query.type;
    try {
        if (type === 'product') {
            await prisma.product.delete({ where: { id } });
        }
        else if (type === 'package') {
            await prisma.package.delete({ where: { id } });
        }
        else {
            await prisma.service.delete({ where: { id } });
        }
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete this item because it is linked to existing invoices or appointments.' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Membership Plans
app.get('/api/membership-plans', async (req, res) => {
    try {
        const plans = await prisma.membershipPlan.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/membership-plans', async (req, res) => {
    try {
        const { name, price, durationDays } = req.body;
        // Generate code
        const lastPlan = await prisma.membershipPlan.findFirst({ orderBy: { code: 'desc' } });
        let nextNum = 1;
        if (lastPlan && lastPlan.code.startsWith('MEM-')) {
            nextNum = (parseInt(lastPlan.code.split('-')[1]) || 0) + 1;
        }
        const code = `MEM-${nextNum.toString().padStart(4, '0')}`;
        const newPlan = await prisma.membershipPlan.create({
            data: { code, name, price, durationDays }
        });
        res.json(newPlan);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Staff
app.get('/api/staff', async (req, res) => {
    try {
        const staff = await prisma.staff.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/staff/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const staff = await prisma.staff.findUnique({
            where: { id }
        });
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/staff', async (req, res) => {
    try {
        const { name, role, phone, rating, status, experience, specialization } = req.body;
        const newStaff = await prisma.staff.create({
            data: {
                name,
                role: role || 'Stylist',
                phone,
                rating: rating ? Number(rating) : 5.0,
                status: status || 'Active',
                experience,
                specialization
            }
        });
        res.json(newStaff);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/staff/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, role, phone, rating, status, experience, specialization } = req.body;
        const updatedStaff = await prisma.staff.update({
            where: { id },
            data: {
                name,
                role: role || 'Stylist',
                phone,
                rating: rating ? Number(rating) : 5.0,
                status,
                experience,
                specialization
            }
        });
        res.json(updatedStaff);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/staff/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.staff.delete({ where: { id } });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete staff member because they are linked to existing invoices or appointments.' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Inactive Customers
app.get('/api/customers/inactive', async (req, res) => {
    try {
        // Get threshold from settings or default to 35
        const setting = await prisma.setting.findUnique({
            where: { key: 'customer_retention' }
        });
        let thresholdDays = 35;
        if (setting) {
            const val = JSON.parse(setting.value);
            thresholdDays = parseInt(val.threshold) || 35;
        }
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
        // Find customers whose last visit (invoice) was before thresholdDate
        const inactiveCustomers = await prisma.customer.findMany({
            where: {
                history: {
                    some: {
                        date: { lt: thresholdDate }
                    },
                    none: {
                        date: { gte: thresholdDate }
                    }
                }
            },
            include: {
                history: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            }
        });
        const formatted = inactiveCustomers.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            lastVisit: c.history[0]?.date,
            daysInactive: Math.floor((new Date().getTime() - new Date(c.history[0]?.date).getTime()) / (1000 * 3600 * 24))
        }));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                history: {
                    include: {
                        items: {
                            include: {
                                service: true,
                                product: true,
                                package: true,
                                staff: true
                            }
                        },
                        payments: true
                    },
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/customers', async (req, res) => {
    try {
        const { name, phone, isMember, membershipTier, membershipExpiry } = req.body;
        let membershipId = null;
        if (isMember) {
            const lastMember = await prisma.customer.findFirst({
                where: { membershipId: { not: null } },
                orderBy: { membershipId: 'desc' }
            });
            let nextNum = 1;
            if (lastMember && lastMember.membershipId?.startsWith('RAS-M-')) {
                nextNum = (parseInt(lastMember.membershipId.split('-')[2]) || 0) + 1;
            }
            membershipId = `RAS-M-${nextNum.toString().padStart(4, '0')}`;
        }
        const newCustomer = await prisma.customer.create({
            data: {
                name,
                phone,
                isMember: !!isMember,
                membershipId,
                membershipTier: membershipTier || 'Standard',
                membershipStart: isMember ? new Date() : null,
                membershipExpiry: membershipExpiry ? new Date(membershipExpiry) : null
            }
        });
        res.json(newCustomer);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A customer with this phone number or membership ID already exists.' });
        }
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, phone, isMember, membershipTier, membershipExpiry, membershipStart } = req.body;
        const existing = await prisma.customer.findUnique({ where: { id } });
        let membershipId = existing?.membershipId;
        if (isMember && !membershipId) {
            const lastMember = await prisma.customer.findFirst({
                where: { membershipId: { not: null } },
                orderBy: { membershipId: 'desc' }
            });
            let nextNum = 1;
            if (lastMember && lastMember.membershipId?.startsWith('RAS-M-')) {
                nextNum = (parseInt(lastMember.membershipId.split('-')[2]) || 0) + 1;
            }
            membershipId = `RAS-M-${nextNum.toString().padStart(4, '0')}`;
        }
        const updatedCustomer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                phone,
                isMember: !!isMember,
                membershipId: isMember ? membershipId : null,
                membershipTier,
                membershipStart: membershipStart ? new Date(membershipStart) : (isMember && !existing?.membershipStart ? new Date() : existing?.membershipStart),
                membershipExpiry: membershipExpiry ? new Date(membershipExpiry) : null
            }
        });
        res.json(updatedCustomer);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A customer with this phone number or membership ID already exists.' });
        }
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.customer.delete({ where: { id } });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete customer because they have existing invoice history.' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Create Bill
app.post('/api/billing', async (req, res) => {
    const { customerId, items, payments, totalDiscount = 0 } = req.body;
    try {
        const totalGross = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        const totalNet = totalGross - totalDiscount;
        let invoice;
        let retries = 3;
        while (retries > 0) {
            try {
                // Determine highest invoice ID correctly
                const lastInvoice = await prisma.invoice.findFirst({
                    orderBy: { invoiceId: 'desc' }
                });
                let nextNum = 1;
                if (lastInvoice && lastInvoice.invoiceId.startsWith('INV-')) {
                    const lastPart = lastInvoice.invoiceId.split('-')[1];
                    const lastNum = parseInt(lastPart);
                    if (!isNaN(lastNum))
                        nextNum = lastNum + 1;
                }
                const nextInvoiceId = `INV-${nextNum.toString().padStart(4, '0')}`;
                invoice = await prisma.invoice.create({
                    data: {
                        invoiceId: nextInvoiceId,
                        customerId,
                        totalGross,
                        totalDiscount,
                        totalNet,
                        items: {
                            create: items.map((item) => ({
                                serviceId: item.serviceId,
                                productId: item.productId,
                                packageId: item.packageId,
                                membershipPlanId: item.membershipPlanId,
                                staffId: item.staffId,
                                quantity: item.quantity || 1,
                                price: item.price,
                                total: item.price * (item.quantity || 1)
                            }))
                        },
                        payments: {
                            create: payments.map((p) => ({
                                method: p.method,
                                amount: p.amount
                            }))
                        }
                    }
                });
                // Check if any item is a membership plan and activate it
                const membershipItem = items.find((item) => item.membershipPlanId);
                if (membershipItem && customerId) {
                    const plan = await prisma.membershipPlan.findUnique({
                        where: { id: membershipItem.membershipPlanId }
                    });
                    if (plan) {
                        const expiryDate = new Date();
                        expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
                        const lastMember = await prisma.customer.findFirst({
                            where: { membershipId: { not: null } },
                            orderBy: { membershipId: 'desc' }
                        });
                        let nextNumM = 1;
                        if (lastMember && lastMember.membershipId?.startsWith('RAS-M-')) {
                            nextNumM = (parseInt(lastMember.membershipId.split('-')[2]) || 0) + 1;
                        }
                        const mId = `RAS-M-${nextNumM.toString().padStart(4, '0')}`;
                        await prisma.customer.update({
                            where: { id: customerId },
                            data: {
                                isMember: true,
                                membershipId: mId,
                                membershipStart: new Date(),
                                membershipExpiry: expiryDate,
                                membershipTier: "Standard" // Default for now
                            }
                        });
                    }
                }
                break; // Exit loop on success
            }
            catch (e) {
                if (e.code === 'P2002' && retries > 1) { // Unique violation
                    retries--;
                    continue;
                }
                throw e; // Rethrow on other errors
            }
        }
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get Bills/Invoices
app.get('/api/billing', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const invoices = await prisma.invoice.findMany({
            include: {
                customer: true,
                items: {
                    include: {
                        staff: true,
                        service: true,
                        product: true,
                        package: true,
                        membershipPlan: true
                    }
                },
                payments: true
            },
            orderBy: {
                date: 'desc'
            },
            skip: skip,
            take: limit
        });
        // Map to match the frontend expectations
        const formattedInvoices = invoices.map((inv) => ({
            id: inv.invoiceId,
            customerId: inv.customerId,
            customer: inv.customer,
            createdAt: inv.date.toISOString(),
            totalGross: inv.totalGross,
            totalDiscount: inv.totalDiscount,
            total: inv.totalNet,
            items: inv.items,
            payments: inv.payments
        }));
        res.json(formattedInvoices);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get Single Bill/Invoice
app.get('/api/billing/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const invoice = await prisma.invoice.findUnique({
            where: { invoiceId: id },
            include: {
                customer: true,
                items: {
                    include: {
                        service: true,
                        product: true,
                        package: true,
                        membershipPlan: true,
                        staff: true
                    }
                },
                payments: true
            }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        // Format to match frontend expectations optionally
        const formattedInvoice = {
            id: invoice.invoiceId,
            customerId: invoice.customerId,
            customer: invoice.customer,
            createdAt: invoice.date.toISOString(),
            totalGross: invoice.totalGross,
            totalDiscount: invoice.totalDiscount,
            total: invoice.totalNet,
            items: invoice.items,
            payments: invoice.payments
        };
        res.json(formattedInvoice);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update Bill/Invoice
app.put('/api/billing/:id', async (req, res) => {
    const invoiceIdParam = req.params.id;
    const { customerId, items, payments, totalDiscount = 0 } = req.body;
    try {
        const totalGross = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        const totalNet = totalGross - totalDiscount;
        // Perform in a transaction to ensure integrity
        const updateResult = await prisma.$transaction(async (tx) => {
            // Find the actual invoice first using invoiceId
            const invoice = await tx.invoice.findUnique({
                where: { invoiceId: invoiceIdParam }
            });
            if (!invoice) {
                throw new Error("Invoice not found");
            }
            // 1. Delete existing items and payments linked to this invoice's internal id
            await tx.invoiceItem.deleteMany({
                where: { invoiceId: invoice.id }
            });
            await tx.payment.deleteMany({
                where: { invoiceId: invoice.id }
            });
            // 2. Update the main invoice and create new items/payments
            return tx.invoice.update({
                where: { invoiceId: invoiceIdParam },
                data: {
                    customerId,
                    totalGross,
                    totalDiscount,
                    totalNet,
                    items: {
                        create: items.map((item) => ({
                            serviceId: item.serviceId,
                            productId: item.productId,
                            packageId: item.packageId,
                            staffId: item.staffId,
                            quantity: item.quantity || 1,
                            price: item.price,
                            total: item.price * (item.quantity || 1)
                        }))
                    },
                    payments: {
                        create: payments.map((p) => ({
                            method: p.method,
                            amount: p.amount
                        }))
                    }
                }
            });
        });
        res.json(updateResult);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete Bill/Invoice
app.delete('/api/billing/:id', async (req, res) => {
    try {
        const invoiceIdParam = req.params.id;
        // Ensure it exists first internally
        const invoice = await prisma.invoice.findUnique({
            where: { invoiceId: invoiceIdParam }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        // We must delete dependent records first inside a transaction or manually
        await prisma.$transaction([
            prisma.invoiceItem.deleteMany({
                where: { invoiceId: invoice.id }
            }),
            prisma.payment.deleteMany({
                where: { invoiceId: invoice.id }
            }),
            prisma.invoice.delete({
                where: { invoiceId: invoiceIdParam } // Using the string ID frontend uses
            })
        ]);
        res.json({ message: 'Invoice deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Day Closing
app.get('/api/closing/status', async (req, res) => {
    try {
        const { date } = req.query;
        // Determine the start and end of the target day
        let startOfDay, endOfDay;
        if (date) {
            startOfDay = new Date(`${date}T00:00:00.000Z`);
            endOfDay = new Date(`${date}T23:59:59.999Z`);
        }
        else {
            startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
        }
        // Calculate expected totals from payments within the day
        const paymentsDay = await prisma.payment.findMany({
            where: {
                invoice: {
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            }
        });
        const expectedCash = paymentsDay
            .filter((p) => p.method === 'Cash')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalUPI = paymentsDay
            .filter((p) => p.method === 'GPay' || p.method === 'Paytm' || p.method === 'PhonePe')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalCard = paymentsDay
            .filter((p) => p.method === 'Card')
            .reduce((sum, p) => sum + p.amount, 0);
        // Check if already closed for this day
        const existingClosing = await prisma.dailyClosing.findFirst({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
        res.json({
            expectedCash,
            totalUPI,
            totalCard,
            isClosed: !!existingClosing,
            closingData: existingClosing
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/closing', async (req, res) => {
    try {
        const { date, expectedCash, actualCash, difference, totalUPI, totalCard, notes } = req.body;
        let recordDate = new Date();
        if (date) {
            recordDate = new Date(`${date}T23:59:59.000Z`); // End of the selected day
        }
        const closing = await prisma.dailyClosing.create({
            data: {
                date: recordDate,
                expectedCash,
                actualCash,
                difference,
                totalUPI,
                totalCard,
                notes
            }
        });
        res.json(closing);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const { date } = req.query;
        let whereClause = {};
        if (date) {
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);
            whereClause = {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            };
        }
        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                staff: true,
                service: true
            },
            orderBy: [
                { date: 'asc' },
                { time: 'asc' }
            ]
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/appointments', async (req, res) => {
    try {
        const { customerName, customerPhone, staffId, serviceId, date, time, status, notes } = req.body;
        const parsedDate = new Date(`${date}T00:00:00.000Z`);
        const appointment = await prisma.appointment.create({
            data: {
                customerName,
                customerPhone,
                staffId,
                serviceId,
                date: parsedDate,
                time,
                status: status || 'Scheduled',
                notes
            },
            include: {
                staff: true,
                service: true
            }
        });
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { customerName, customerPhone, staffId, serviceId, date, time, status, notes } = req.body;
        let updateData = {
            customerName,
            customerPhone,
            staffId,
            serviceId,
            time,
            status,
            notes
        };
        if (date) {
            updateData.date = new Date(`${date}T00:00:00.000Z`);
        }
        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: {
                staff: true,
                service: true
            }
        });
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.appointment.delete({
            where: { id }
        });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Settings
app.get('/api/settings/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const setting = await prisma.setting.findUnique({
            where: { key }
        });
        if (setting) {
            res.json(JSON.parse(setting.value));
        }
        else {
            res.json({}); // Default empty state for the frontend to handle
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/settings/:key', async (req, res) => {
    try {
        const key = req.params.key;
        // Fetch existing setting to merge
        const existingSetting = await prisma.setting.findUnique({ where: { key } });
        let newValueObj = req.body;
        if (existingSetting) {
            try {
                const existingValueObj = JSON.parse(existingSetting.value);
                newValueObj = { ...existingValueObj, ...newValueObj };
            }
            catch (e) {
                // Ignore parse errors on existing setting
            }
        }
        const value = JSON.stringify(newValueObj);
        const updatedSetting = await prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(JSON.parse(updatedSetting.value));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Retrieve security setting
        const setting = await prisma.setting.findUnique({
            where: { key: 'security' }
        });
        const storedPassword = setting ? JSON.parse(setting.value).password : 'admin123';
        if (email === "admin@ras.com" && password === storedPassword) {
            res.json({ success: true, user: { name: "Admin", email } });
        }
        else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(Number(PORT), 'localhost', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
