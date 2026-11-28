// Bespoke Showcase Admin Management Console
// Handcrafted by Shahan Ali for client demonstration & store administration

(function() {
    // Domain profiles for tailored client demonstration
    const DOMAIN_PROFILES = {
        'luxecart': {
            name: 'LuxeCart Haute Horlogerie',
            tagline: 'Timepiece Vault, Valuation Appraisal & Luxury Escrow Operations',
            currency: '$',
            revenue: 342500,
            ordersCount: 84,
            conversion: '5.2%',
            metrics: [
                { label: 'Vault Inventory', value: '$2,480,000', change: '16 Timepieces' },
                { label: 'Escrow Status', value: '100% Secured', change: 'Swiss Custody' },
                { label: 'Avg Order Value', value: '$42,800', change: '↑ 12% MoM' },
                { label: 'Auth Approvals', value: '48 Approved', change: 'COSC Certified' }
            ],
            orders: [
                { id: 'LX-901', customer: 'Lord Henry Sterling', item: 'Patek Philippe Celestial 6102P', amount: 380000, status: 'Completed', date: '10 mins ago' },
                { id: 'LX-902', customer: 'Elena Rostova', item: 'Audemars Piguet Royal Oak Double Balance', amount: 89000, status: 'Processing', date: '35 mins ago' },
                { id: 'LX-903', customer: 'Maximilian Vance', item: 'Rolex Daytona Rainbow Diamond Bezel', amount: 145000, status: 'Completed', date: '2 hours ago' },
                { id: 'LX-904', customer: 'Sophia Dubois', item: 'Vacheron Constantin Overseas Tourbillon', amount: 112000, status: 'Pending', date: '4 hours ago' }
            ],
            inventory: [
                { name: 'Patek Philippe Grand Complications', price: 380000, stock: 1, category: 'Tourbillon' },
                { name: 'Audemars Piguet Openworked', price: 89000, stock: 2, category: 'Skeleton' },
                { name: 'Rolex Daytona Rainbow Bezel', price: 145000, stock: 1, category: 'Chronograph' },
                { name: 'Richard Mille RM 11-03 Flyback', price: 295000, stock: 1, category: 'Hyper-Watch' },
                { name: 'A. Lange & Söhne Datograph', price: 118000, stock: 2, category: 'Haute Horlogerie' }
            ]
        },
        'devmarket': {
            name: 'DevMarket Codebase Hub',
            tagline: 'SaaS Boilerplates, API Starter Kits & Developer License Payouts',
            currency: '$',
            revenue: 68400,
            ordersCount: 412,
            conversion: '7.8%',
            metrics: [
                { label: 'Active Repositories', value: '28 Starters', change: 'Verified Source' },
                { label: 'Instant ZIP Delivery', value: '99.9%', change: 'Automated' },
                { label: 'Developer Payouts', value: '$48,200', change: '80% Net Share' },
                { label: 'Active Subscriptions', value: '320 Devs', change: '↑ 24% Growth' }
            ],
            orders: [
                { id: 'DEV-412', customer: 'Alex Rivera (Staff Eng)', item: 'Multi-Tenant SaaS Starter Kit (Next.js 14)', amount: 149, status: 'Completed', date: 'Just now' },
                { id: 'DEV-411', customer: 'David K. (Founder)', item: 'WhatsApp Automated Bot Engine (Baileys)', amount: 129, status: 'Completed', date: '18 mins ago' },
                { id: 'DEV-410', customer: 'Marcus Sterling', item: 'AI Agent Multi-Model Workspace Template', amount: 199, status: 'Completed', date: '1 hour ago' },
                { id: 'DEV-409', customer: 'Tariq Hassan', item: 'Stripe Micro-SaaS Billing Scaffold', amount: 89, status: 'Processing', date: '3 hours ago' }
            ],
            inventory: [
                { name: 'Full-Stack Next.js SaaS Boilerplate', price: 149, stock: 999, category: 'Boilerplate' },
                { name: 'Production WhatsApp Baileys Bot Node', price: 129, stock: 999, category: 'Bot Starter' },
                { name: 'Multi-Agent LLM Orchestration Kit', price: 199, stock: 999, category: 'AI Tools' },
                { name: 'Tailwind + React Component Vault Pro', price: 99, stock: 999, category: 'UI Kit' },
                { name: 'PostgreSQL Multi-Tenant Drizzle Schema', price: 79, stock: 999, category: 'Database' }
            ]
        },
        'autovault': {
            name: 'AutoVault Exotic Dealership',
            tagline: 'Twin-Turbo Fleet Allocations, Test Drive Scheduling & Private Acquisitions',
            currency: '$',
            revenue: 1840000,
            ordersCount: 18,
            conversion: '3.4%',
            metrics: [
                { label: 'Fleet Inventory Value', value: '$14.2M', change: '12 Hypercars' },
                { label: 'Track Inquiries', value: '42 Scheduled', change: 'VIP Clients' },
                { label: 'Average HP', value: '880 HP', change: 'Twin-Turbo V8/V12' },
                { label: 'Dealer Margin', value: '14.2%', change: 'Pre-Approved' }
            ],
            orders: [
                { id: 'AV-701', customer: 'Sebastian Rossi', item: 'Ferrari SF90 XX Stradale (1016 HP)', amount: 890000, status: 'Completed', date: '1 hour ago' },
                { id: 'AV-702', customer: 'Hamza Al-Maktoum', item: 'Koenigsegg Jesko Attack (1600 HP)', amount: 3400000, status: 'Processing', date: '3 hours ago' },
                { id: 'AV-703', customer: 'Julian Sterling', item: 'Porsche 911 GT3 RS Weissach', amount: 385000, status: 'Completed', date: 'Yesterday' }
            ],
            inventory: [
                { name: 'Ferrari SF90 XX Stradale', price: 890000, stock: 1, category: 'Hypercar' },
                { name: 'Koenigsegg Jesko Attack', price: 3400000, stock: 1, category: 'Megacar' },
                { name: 'Porsche 911 GT3 RS Weissach', price: 385000, stock: 2, category: 'Track Special' },
                { name: 'McLaren 750S Spider Carbon', price: 420000, stock: 1, category: 'Supercar' },
                { name: 'Lamborghini Revuelto V12 Hybrid', price: 608000, stock: 1, category: 'V12 Flagship' }
            ]
        },
        'biterush': {
            name: 'BiteRush Kitchen & Fleet Console',
            tagline: 'Live Kitchen Ticket Dispatch, GPS Courier Fleet & Gourmet Menu Pricing',
            currency: '$',
            revenue: 34200,
            ordersCount: 892,
            conversion: '14.2%',
            metrics: [
                { label: 'Active Kitchen Tickets', value: '14 Orders', change: 'Avg 12m Prep' },
                { label: 'Active Couriers', value: '18 Drivers', change: 'Live GPS Sync' },
                { label: 'Daily Delivery Gross', value: '$4,890', change: '↑ 22% Peak Hour' },
                { label: 'Customer CSAT', value: '4.9 / 5.0', change: '620 Reviews' }
            ],
            orders: [
                { id: 'BR-881', customer: 'Chloe Bennett', item: 'Truffle Wagyu Burger + Garlic Aioli Fries', amount: 38.50, status: 'Processing', date: '4 mins ago' },
                { id: 'BR-880', customer: 'Marcus Brody', item: 'Artisan Neapolitan Burrata Pizza', amount: 29.00, status: 'Completed', date: '12 mins ago' },
                { id: 'BR-879', customer: 'Sarah Lin', item: 'Salmon Teriyaki Bowl + Matcha Boba', amount: 34.00, status: 'Completed', date: '25 mins ago' }
            ],
            inventory: [
                { name: 'Smoked Wagyu Gold Leaf Burger', price: 28, stock: 45, category: 'Entrees' },
                { name: 'Truffle Parmesan Hand-Cut Fries', price: 10, stock: 120, category: 'Sides' },
                { name: 'Wood-Fired Neapolitan Pizza', price: 24, stock: 35, category: 'Pizzas' },
                { name: 'Bespoke Nitro Cold Brew Float', price: 8, stock: 80, category: 'Beverages' }
            ]
        },
        'nestora': {
            name: 'Nestora Architectural Estates',
            tagline: 'Prime Property Portfolio, Escrow Contracts & Private Viewing Dispatch',
            currency: '$',
            revenue: 4850000,
            ordersCount: 22,
            conversion: '2.1%',
            metrics: [
                { label: 'Portfolio Value', value: '$84.5M', change: '8 Prime Estates' },
                { label: 'Escrow Pipeline', value: '$12.8M', change: '3 Pending Closes' },
                { label: 'Private Viewings', value: '38 Booked', change: 'Verified Buyers' },
                { label: 'Broker Yield', value: '4.5%', change: 'Direct Advisory' }
            ],
            orders: [
                { id: 'NEST-104', customer: 'Victoria Sterling', item: 'Bel-Air Minimalist Glass Villa', amount: 18500000, status: 'Processing', date: '2 hours ago' },
                { id: 'NEST-103', customer: 'Dmitri Volkov', item: 'Monaco Coastal Penthouse with Heli-Pad', amount: 24000000, status: 'Completed', date: 'Yesterday' }
            ],
            inventory: [
                { name: 'Bel-Air Minimalist Glass Villa', price: 18500000, stock: 1, category: 'Modernist' },
                { name: 'Monaco Coastal Penthouse', price: 24000000, stock: 1, category: 'Penthouse' },
                { name: 'Aspen Nordic Pine Chalet', price: 12400000, stock: 1, category: 'Mountain Retreat' },
                { name: 'Kyoto Zen Garden Sanctuary', price: 9800000, stock: 1, category: 'Historic' }
            ]
        },
        'soundpulse': {
            name: 'SoundPulse Studio Acoustics',
            tagline: 'High-Fidelity Audio Gear, Studio Monitor Inventory & Lossless Sound Orders',
            currency: '$',
            revenue: 128400,
            ordersCount: 164,
            conversion: '6.4%',
            metrics: [
                { label: 'Studio Units in Stock', value: '340 Units', change: 'Direct Audiophile' },
                { label: 'Active DAC Shipments', value: '28 Orders', change: 'Lossless Tier' },
                { label: 'Avg Basket Size', value: '$840.00', change: '↑ 14% this month' },
                { label: 'Sound QA Pass', value: '100%', change: '0.001% THD+N' }
            ],
            orders: [
                { id: 'SP-304', customer: 'Hans Zimmer Studio', item: 'Reference 3-Way Coaxial Studio Monitors (Pair)', amount: 3450, status: 'Completed', date: '30 mins ago' },
                { id: 'SP-303', customer: 'Liam Gallagher', item: 'Direct-Drive Audiophile Vinyl Turntable', amount: 1890, status: 'Processing', date: '1 hour ago' },
                { id: 'SP-302', customer: 'Julian Casablancas', item: 'Planar Magnetic Open-Back Headphones', amount: 1250, status: 'Completed', date: '4 hours ago' }
            ],
            inventory: [
                { name: 'Reference 3-Way Coaxial Monitors', price: 3450, stock: 8, category: 'Monitors' },
                { name: 'Direct-Drive Vinyl Turntable Carbon', price: 1890, stock: 14, category: 'Analog' },
                { name: 'Planar Magnetic Headphones 50mm', price: 1250, stock: 22, category: 'Headphones' },
                { name: 'Balanced R-2R Ladder DAC Engine', price: 950, stock: 18, category: 'Electronics' }
            ]
        }
    };

    function getDomainSlug() {
        const path = window.location.pathname.toLowerCase();
        for (const key of Object.keys(DOMAIN_PROFILES)) {
            if (path.includes(key)) return key;
        }
        return 'general';
    }

    window.ShowcaseAdmin = {
        config: {
            platformName: document.title.split('—')[0].split('|')[0].trim() || 'Platform Console',
            currency: '$',
            taxRate: 8.5,
            shippingFee: 0,
            maintenanceMode: false,
            adminEmail: 'shahanali.official315@gmail.com',
            totalRevenue: 54900,
            totalOrders: 148,
            conversionRate: '5.8%'
        },
        orders: [],
        inventory: [],
        metrics: [],

        init: function() {
            const slug = getDomainSlug();
            const profile = DOMAIN_PROFILES[slug];
            
            if (profile) {
                this.config.platformName = profile.name;
                this.config.currency = profile.currency;
                this.config.totalRevenue = profile.revenue;
                this.config.totalOrders = profile.ordersCount;
                this.config.conversionRate = profile.conversion;
                this.orders = JSON.parse(JSON.stringify(profile.orders));
                this.inventory = JSON.parse(JSON.stringify(profile.inventory));
                this.metrics = profile.metrics || [];
            } else {
                this.orders = [
                    { id: 'ORD-9841', customer: 'Alexander Vance', item: 'Premium Enterprise License Tier', amount: 2450, status: 'Completed', date: 'Just now' },
                    { id: 'ORD-9840', customer: 'Elena Rostova', item: 'Bespoke Custom Client Package', amount: 1890, status: 'Processing', date: '14 mins ago' },
                    { id: 'ORD-9839', customer: 'Marcus Sterling', item: 'Executive Suite Edition', amount: 4200, status: 'Completed', date: '1 hour ago' },
                    { id: 'ORD-9838', customer: 'Sophia Chen', item: 'Standard Model Tier', amount: 950, status: 'Pending', date: '3 hours ago' }
                ];
                this.inventory = [
                    { name: 'Core Platform Flagship', price: 1450, stock: 12, category: 'Core' },
                    { name: 'Enterprise Edition Tier', price: 2890, stock: 5, category: 'Enterprise' },
                    { name: 'Specialist Starter Bundle', price: 790, stock: 24, category: 'Standard' },
                    { name: 'Customized Bespoke Unit', price: 3400, stock: 3, category: 'Custom' }
                ];
            }

            this.loadState();
            this.injectAdminModal();
        },

        loadState: function() {
            try {
                const saved = localStorage.getItem('showcase_admin_' + window.location.pathname);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.config) this.config = { ...this.config, ...parsed.config };
                    if (parsed.orders && parsed.orders.length) this.orders = parsed.orders;
                    if (parsed.inventory && parsed.inventory.length) this.inventory = parsed.inventory;
                }
            } catch (e) {
                console.warn('Storage load error:', e);
            }
        },

        saveState: function() {
            try {
                localStorage.setItem('showcase_admin_' + window.location.pathname, JSON.stringify({
                    config: this.config,
                    orders: this.orders,
                    inventory: this.inventory
                }));
            } catch (e) {
                console.warn('Storage save error:', e);
            }
        },

        injectAdminModal: function() {
            if (document.getElementById('showcase-admin-modal')) return;

            const modalHtml = `
            <div id="showcase-admin-modal" class="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md hidden items-center justify-center p-4">
                <div class="bg-slate-950 border border-emerald-500/30 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs antialiased font-sans">
                    
                    <!-- Top Bar -->
                    <div class="px-6 py-4 bg-slate-900/90 border-b border-emerald-500/20 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                                <i data-lucide="shield-check" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="font-bold text-white text-sm tracking-wide" id="admin-platform-title">${this.config.platformName} Management Console</h3>
                                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">Live Admin Panel</span>
                                </div>
                                <p class="text-[11px] text-slate-400">Production operational dashboard, live inventory stock, order queues & merchant settings</p>
                            </div>
                        </div>
                        <button onclick="ShowcaseAdmin.close()" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <!-- Navigation Tabs -->
                    <div class="px-6 bg-slate-900/50 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
                        <button onclick="ShowcaseAdmin.switchTab('analytics')" id="admin-tab-btn-analytics" class="admin-tab-btn px-4 py-3 font-bold border-b-2 border-emerald-400 text-emerald-400 flex items-center gap-2 cursor-pointer transition-all">
                            <i data-lucide="bar-chart-3" class="w-4 h-4"></i> Overview & Revenue
                        </button>
                        <button onclick="ShowcaseAdmin.switchTab('orders')" id="admin-tab-btn-orders" class="admin-tab-btn px-4 py-3 font-semibold border-b-2 border-transparent text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-all">
                            <i data-lucide="shopping-bag" class="w-4 h-4"></i> Transactions & Queue (<span id="admin-orders-count-badge">${this.orders.length}</span>)
                        </button>
                        <button onclick="ShowcaseAdmin.switchTab('inventory')" id="admin-tab-btn-inventory" class="admin-tab-btn px-4 py-3 font-semibold border-b-2 border-transparent text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-all">
                            <i data-lucide="boxes" class="w-4 h-4"></i> Catalog & Inventory (${this.inventory.length})
                        </button>
                        <button onclick="ShowcaseAdmin.switchTab('settings')" id="admin-tab-btn-settings" class="admin-tab-btn px-4 py-3 font-semibold border-b-2 border-transparent text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-all">
                            <i data-lucide="sliders" class="w-4 h-4"></i> Platform Config
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 overflow-y-auto flex-1 space-y-6">
                        
                        <!-- TAB 1: ANALYTICS & METRICS -->
                        <div id="admin-tab-analytics" class="admin-tab-content space-y-6">
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div class="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-1">
                                    <span class="text-[10px] text-slate-400 font-medium">Gross Revenue</span>
                                    <div class="text-xl font-black text-emerald-400" id="admin-stat-rev">${this.config.currency}${this.config.totalRevenue.toLocaleString()}</div>
                                    <span class="text-[10px] text-emerald-400 font-mono">↑ 22.4% weekly velocity</span>
                                </div>
                                <div class="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-1">
                                    <span class="text-[10px] text-slate-400 font-medium">Total Orders / Requests</span>
                                    <div class="text-xl font-black text-cyan-400" id="admin-stat-orders">${this.config.totalOrders}</div>
                                    <span class="text-[10px] text-cyan-400 font-mono">100% Verified SLAs</span>
                                </div>
                                <div class="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-1">
                                    <span class="text-[10px] text-slate-400 font-medium">Conversion Rate</span>
                                    <div class="text-xl font-black text-purple-400">${this.config.conversionRate}</div>
                                    <span class="text-[10px] text-purple-400 font-mono">Top Tier Benchmark</span>
                                </div>
                                <div class="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-1">
                                    <span class="text-[10px] text-slate-400 font-medium">System Uptime</span>
                                    <div class="text-xl font-black text-amber-400 flex items-center gap-1.5">
                                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 99.99%
                                    </div>
                                    <span class="text-[10px] text-slate-400 font-mono">Zero Latency CDN</span>
                                </div>
                            </div>

                            <!-- Live Activity Chart Representation -->
                            <div class="bg-slate-900/60 border border-white/10 rounded-xl p-5 space-y-3">
                                <div class="flex items-center justify-between">
                                    <h4 class="font-bold text-white text-xs flex items-center gap-2">
                                        <i data-lucide="trending-up" class="w-4 h-4 text-emerald-400"></i> Weekly Performance & Sales Volume
                                    </h4>
                                    <span class="text-[10px] text-slate-400 font-mono">Real-Time Ingress Telemetry</span>
                                </div>
                                <div class="grid grid-cols-7 gap-2 items-end h-28 pt-4">
                                    <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div class="w-full bg-emerald-500/20 border border-emerald-500/40 rounded-t-md hover:bg-emerald-500/40 transition-colors" style="height: 48%;"></div>
                                        <span class="text-[9px] text-slate-400">Mon</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div class="w-full bg-emerald-500/20 border border-emerald-500/40 rounded-t-md hover:bg-emerald-500/40 transition-colors" style="height: 65%;"></div>
                                        <span class="text-[9px] text-slate-400">Tue</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div class="w-full bg-emerald-500/20 border border-emerald-500/40 rounded-t-md hover:bg-emerald-500/40 transition-colors" style="height: 78%;"></div>
                                        <span class="text-[9px] text-slate-400">Wed</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div class="w-full bg-emerald-500/30 border border-emerald-500/60 rounded-t-md hover:bg-emerald-500/50 transition-colors" style="height: 92%;"></div>
                                        <span class="text-[9px] text-slate-400">Thu</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div class="w-full bg-emerald-500/30 border border-emerald-500/60 rounded-t-md hover:bg-emerald-500/50 transition-colors" style="height: 70%;"></div>
                                        <span class="text-[9px] text-slate-400">Fri</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div class="w-full bg-emerald-500/40 border border-emerald-500/80 rounded-t-md hover:bg-emerald-500/60 transition-colors" style="height: 100%;"></div>
                                        <span class="text-[9px] text-emerald-400 font-bold">Sat</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div class="w-full bg-emerald-500/35 border border-emerald-500/70 rounded-t-md hover:bg-emerald-500/50 transition-colors" style="height: 85%;"></div>
                                        <span class="text-[9px] text-slate-400">Sun</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB 2: ORDER QUEUE -->
                        <div id="admin-tab-orders" class="admin-tab-content hidden space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold text-white text-xs">Active Customer Orders & Inquiries Queue</h4>
                                    <p class="text-[10px] text-slate-400">Instant status updates, fulfillment routing, and tracking codes</p>
                                </div>
                                <button onclick="ShowcaseAdmin.addSampleOrder()" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1.5">
                                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Simulate Incoming Order
                                </button>
                            </div>
                            <div class="overflow-x-auto border border-white/10 rounded-xl">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono">
                                        <tr>
                                            <th class="px-4 py-2.5">ID</th>
                                            <th class="px-4 py-2.5">Client / Buyer</th>
                                            <th class="px-4 py-2.5">Product / Package</th>
                                            <th class="px-4 py-2.5">Amount</th>
                                            <th class="px-4 py-2.5">Status</th>
                                            <th class="px-4 py-2.5">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="admin-orders-tbody" class="divide-y divide-white/5 bg-slate-950/60">
                                        <!-- Injected via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- TAB 3: CATALOG & INVENTORY -->
                        <div id="admin-tab-inventory" class="admin-tab-content hidden space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold text-white text-xs">Live Catalog Stock & Product Offerings</h4>
                                    <p class="text-[10px] text-slate-400">Directly adjust pricing, stock quantities, and availability</p>
                                </div>
                                <button onclick="ShowcaseAdmin.showQuickAddPrompt()" class="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 cursor-pointer flex items-center gap-1.5">
                                    <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> Add New Product
                                </button>
                            </div>

                            <div id="admin-inventory-list" class="space-y-2 max-h-72 overflow-y-auto pr-1">
                                <!-- Injected via JS -->
                            </div>
                        </div>

                        <!-- TAB 4: PLATFORM SETTINGS -->
                        <div id="admin-tab-settings" class="admin-tab-content hidden space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-bold uppercase text-slate-400">Brand Platform Name</label>
                                    <input type="text" id="admin-setting-name" value="${this.config.platformName}" class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-bold uppercase text-slate-400">Store Currency</label>
                                    <input type="text" id="admin-setting-currency" value="${this.config.currency}" class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-bold uppercase text-slate-400">Sales Tax Rate (%)</label>
                                    <input type="number" id="admin-setting-tax" value="${this.config.taxRate}" class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-bold uppercase text-slate-400">Administrator Email</label>
                                    <input type="email" id="admin-setting-email" value="${this.config.adminEmail}" class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400">
                                </div>
                            </div>

                            <div class="bg-slate-900/70 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <h5 class="font-bold text-white text-xs">Live Storefront Maintenance Mode</h5>
                                    <p class="text-[10px] text-slate-400">Enables high-priority announcement banners across all public client views</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="admin-setting-maint" ${this.config.maintenanceMode ? 'checked' : ''} class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between pt-2">
                                <button onclick="ShowcaseAdmin.resetDefaults()" class="text-xs text-rose-400 hover:underline cursor-pointer">
                                    Reset to Default State
                                </button>
                                <button onclick="ShowcaseAdmin.saveSettings()" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                                    <i data-lucide="check" class="w-4 h-4"></i> Save Store Configuration
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- Footer Actions -->
                    <div class="px-6 py-3.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                        <span class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Handcrafted Showcase Ready for Client Demonstration
                        </span>
                        <div class="flex items-center gap-3">
                            <button onclick="ShowcaseAdmin.exportData()" class="hover:text-white cursor-pointer font-mono">Export Config JSON</button>
                            <span>•</span>
                            <button onclick="ShowcaseAdmin.close()" class="text-emerald-400 font-bold hover:underline cursor-pointer">Close Admin</button>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Toast Container -->
            <div id="showcase-admin-toast" class="fixed bottom-6 right-6 z-[10000] transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none">
                <div class="bg-slate-900 border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 flex-shrink-0"></i>
                    <span id="showcase-toast-msg">Settings saved successfully</span>
                </div>
            </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = modalHtml;
            document.body.appendChild(wrapper);

            if (window.lucide) window.lucide.createIcons();
            this.renderOrders();
            this.renderInventory();
        },

        open: function() {
            this.injectAdminModal();
            const modal = document.getElementById('showcase-admin-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                this.renderOrders();
                this.renderInventory();
                if (window.lucide) window.lucide.createIcons();
            }
        },

        close: function() {
            const modal = document.getElementById('showcase-admin-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        },

        switchTab: function(tabName) {
            document.querySelectorAll('.admin-tab-btn').forEach(btn => {
                btn.classList.remove('border-emerald-400', 'text-emerald-400');
                btn.classList.add('border-transparent', 'text-slate-400');
            });
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));

            const activeBtn = document.getElementById('admin-tab-btn-' + tabName);
            const activeTab = document.getElementById('admin-tab-' + tabName);

            if (activeBtn) {
                activeBtn.classList.add('border-emerald-400', 'text-emerald-400');
                activeBtn.classList.remove('border-transparent', 'text-slate-400');
            }
            if (activeTab) {
                activeTab.classList.remove('hidden');
            }
            if (window.lucide) window.lucide.createIcons();
        },

        renderOrders: function() {
            const tbody = document.getElementById('admin-orders-tbody');
            if (!tbody) return;

            tbody.innerHTML = this.orders.map((o, idx) => `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-4 py-2.5 font-mono text-emerald-400 font-bold">${o.id}</td>
                    <td class="px-4 py-2.5 text-white font-medium">${o.customer}</td>
                    <td class="px-4 py-2.5 text-slate-300">${o.item}</td>
                    <td class="px-4 py-2.5 font-bold text-white">${this.config.currency}${o.amount.toLocaleString()}</td>
                    <td class="px-4 py-2.5">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            o.status === 'Processing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }">${o.status}</span>
                    </td>
                    <td class="px-4 py-2.5">
                        <button onclick="ShowcaseAdmin.toggleOrderStatus(${idx})" class="text-[10px] text-slate-400 hover:text-emerald-400 underline cursor-pointer">
                            Toggle Status
                        </button>
                    </td>
                </tr>
            `).join('');
        },

        toggleOrderStatus: function(idx) {
            const current = this.orders[idx].status;
            if (current === 'Pending') this.orders[idx].status = 'Processing';
            else if (current === 'Processing') this.orders[idx].status = 'Completed';
            else this.orders[idx].status = 'Pending';
            
            this.saveState();
            this.renderOrders();
            this.showToast('Order ' + this.orders[idx].id + ' updated to ' + this.orders[idx].status);
        },

        addSampleOrder: function() {
            const names = ['Michael Thorne', 'Elena Rostova', 'Kareem Abdul', 'David Sterling', 'Sarah Jenkins', 'Hamza Rauf', 'Sophia Dubois'];
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomAmt = Math.floor(Math.random() * 2500) + 350;
            const newId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

            this.orders.unshift({
                id: newId,
                customer: randomName,
                item: 'Custom Client Package #' + Math.floor(Math.random() * 10 + 1),
                amount: randomAmt,
                status: 'Processing',
                date: 'Just now'
            });
            this.config.totalRevenue += randomAmt;
            this.config.totalOrders += 1;

            this.saveState();
            this.renderOrders();
            
            const revEl = document.getElementById('admin-stat-rev');
            const ordersEl = document.getElementById('admin-stat-orders');
            const badgeEl = document.getElementById('admin-orders-count-badge');
            
            if (revEl) revEl.innerText = this.config.currency + this.config.totalRevenue.toLocaleString();
            if (ordersEl) ordersEl.innerText = this.config.totalOrders;
            if (badgeEl) badgeEl.innerText = this.orders.length;
            
            this.showToast('Simulated incoming order ' + newId + ' (' + this.config.currency + randomAmt + ')');
            if (window.lucide) window.lucide.createIcons();
        },

        renderInventory: function() {
            const container = document.getElementById('admin-inventory-list');
            if (!container) return;

            container.innerHTML = this.inventory.map((it, idx) => `
                <div class="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:border-white/20 transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono">
                            #${idx + 1}
                        </div>
                        <div>
                            <div class="font-bold text-white text-xs">${it.name}</div>
                            <div class="text-[10px] text-slate-400 font-mono">Category: ${it.category || 'General'} · Stock: <span class="text-emerald-400 font-bold">${it.stock} units</span></div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-white text-xs">${this.config.currency}${it.price.toLocaleString()}</span>
                        <button onclick="ShowcaseAdmin.editItemPrice(${idx})" class="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-white cursor-pointer">
                            Edit Price
                        </button>
                    </div>
                </div>
            `).join('');
        },

        editItemPrice: function(idx) {
            const item = this.inventory[idx];
            const newPrice = prompt(`Enter new price for "${item.name}":`, item.price);
            if (newPrice && !isNaN(newPrice)) {
                item.price = parseFloat(newPrice);
                this.saveState();
                this.renderInventory();
                this.showToast(`Updated price for ${item.name} to ${this.config.currency}${item.price.toLocaleString()}`);
            }
        },

        showQuickAddPrompt: function() {
            const name = prompt('Enter New Item / Product Name:', 'Executive Package Edition');
            if (!name) return;
            const price = prompt('Enter Price (' + this.config.currency + '):', '1250');
            const stock = prompt('Enter Stock Quantity:', '10');
            
            this.inventory.unshift({
                name: name,
                price: parseFloat(price) || 999,
                stock: parseInt(stock) || 10,
                category: 'Bespoke'
            });
            this.saveState();
            this.renderInventory();
            this.showToast(`New item "${name}" published to live catalog!`);
        },

        saveSettings: function() {
            const nameInput = document.getElementById('admin-setting-name');
            const currInput = document.getElementById('admin-setting-currency');
            const taxInput = document.getElementById('admin-setting-tax');
            const emailInput = document.getElementById('admin-setting-email');
            const maintInput = document.getElementById('admin-setting-maint');

            if (nameInput) this.config.platformName = nameInput.value;
            if (currInput) this.config.currency = currInput.value;
            if (taxInput) this.config.taxRate = parseFloat(taxInput.value) || 0;
            if (emailInput) this.config.adminEmail = emailInput.value;
            if (maintInput) this.config.maintenanceMode = maintInput.checked;

            this.saveState();
            this.showToast('Platform configurations updated and saved!');
            
            const titleEl = document.getElementById('admin-platform-title');
            if (titleEl) titleEl.innerText = this.config.platformName + ' Management Console';
        },

        resetDefaults: function() {
            if (confirm('Reset store configuration to baseline default state?')) {
                localStorage.removeItem('showcase_admin_' + window.location.pathname);
                this.showToast('Reset to default demonstration parameters.');
                setTimeout(() => window.location.reload(), 600);
            }
        },

        exportData: function() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ config: this.config, orders: this.orders, inventory: this.inventory }, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "store_admin_export.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            this.showToast('Exported admin configuration JSON');
        },

        showToast: function(msg) {
            const toast = document.getElementById('showcase-admin-toast');
            const msgEl = document.getElementById('showcase-toast-msg');
            if (toast && msgEl) {
                msgEl.innerText = msg;
                toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
                toast.classList.add('translate-y-0', 'opacity-100');
                if (window.lucide) window.lucide.createIcons();
                setTimeout(() => {
                    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
                    toast.classList.remove('translate-y-0', 'opacity-100');
                }, 3000);
            }
        }
    };

    // Auto-mount on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ShowcaseAdmin.init());
    } else {
        ShowcaseAdmin.init();
    }
})();

// Global convenience function for buttons across headers
window.openShowcaseAdmin = function() {
    if (window.ShowcaseAdmin) {
        window.ShowcaseAdmin.open();
    }
};

window.openDealerAdmin = window.openShowcaseAdmin;
window.openRestAdmin = window.openShowcaseAdmin;
