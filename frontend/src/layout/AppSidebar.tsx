import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router"

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  BoxesIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  StoreIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from "../icons"
import { useSidebar } from "../context/SidebarContext"
import { useUser } from "../context/UserContext"

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  admin?: boolean
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "หน้าหลัก",
    path: "/",
  },
  {
    icon: <UserCircleIcon />,
    name: "การจัดการผู้ใช้งาน",
    path: "/users",
    admin: true,
  },
  // {
  //   icon: <CreditCardIcon />,
  //   name: "การชำระเงิน",
  //   path: "/inpayment",
  // },
  {
    name: "การจัดการหมวดหมู่สินค้า",
    icon: <BoxesIcon />,
    subItems: [
      { name: "หมวดหมู่หลัก", path: "/main-category", pro: false },
      { name: "หมวดหมู่ย่อย", path: "/sub-category", pro: false },
      { name: "ประเภทสินค้า", path: "/product-type", pro: false },
    ],
  },
  {
    name: "การจัดการข้อมูลร้านค้า",
    icon: <StoreIcon />,
    subItems: [
      {
        name: "สไลด์โปรโมชั่น",
        path: "/promotions",
        pro: false,
      },
      { name: "แบรนด์สินค้า", path: "/brands", pro: false },
      {
        name: "สินค้าตัวหลัก",
        path: "/hero-products",
        pro: false,
      },
      { name: "สินค้าหน้าร้าน", path: "/products", pro: false },
      { name: "สินค้าตามสไตล์", path: "/decobystyles", pro: false },
      { name: "แคตตาล็อก", path: "/catalogs", pro: false },
    ],
  },
  {
    name: "การจัดการเนื้อหาเว็บไซต์",
    icon: <PageIcon />,
    subItems: [
      { name: "บริการช่างมือ 1 DECiT", path: "/decit", pro: false },
      { name: "ผลงานช่างมือ 1 DECiT", path: "/decit-projects", pro: false },
      { name: "เกี่ยวกับเรา", path: "/about-us", pro: false },
      { name: "ข้อมูลการติดต่อ", path: "/contacts", pro: false },
      { name: "วิธีการสั่งซื้อสินค้า", path: "/howto-order", pro: false },
      { name: "วิธีการจัดส่งสินค้า", path: "/delivery-term", pro: false },
      { name: "คำถามที่พบบ่อย", path: "/faq", pro: false },
    ],
  },
  // {
  //   name: "จัดการหน้า Email",
  //   icon: <MailIcon />,
  //   path: "/send-mail",
  // },
  {
    name: "การจัดการนโยบาย",
    icon: <ShieldCheckIcon />,
    subItems: [
      { name: "นโยบายคุกกี้", path: "/cookie-policy", pro: false },
      { name: "นโยบายความเป็นสวนตัว", path: "/privacy-policy", pro: false },
      {
        name: "นโยบายการเปลี่ยนคืนสินค้า",
        path: "/exchange-policy",
        pro: false,
      },
      { name: "เงื่อนไขและข้อตกลง", path: "/condition", pro: false },
      { name: "นโยบายกล้องวงจรปิด", path: "/cctv-policy", pro: false },
    ],
  },
]

const othersItems: NavItem[] = [
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
]

const AppSidebar: React.FC = () => {
  const { session } = useUser()
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const location = useLocation()

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others"
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  )

  useEffect(() => {
    let submenuMatched = false
    ;["main", "others"].forEach(menuType => {
      const items = menuType === "main" ? navItems : othersItems
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach(subItem => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              })
              submenuMatched = true
            }
          })
        }
      })
    })

    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [location, isActive])

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight(prevHeights => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu(prevOpenSubmenu => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null
      }
      return { type: menuType, index }
    })
  }

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        if (nav.admin && session?.permission !== "admin") {
          return null
        }
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "text-brand-500 rotate-180"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={el => {
                  subMenuRefs.current[`${menuType}-${index}`] = el
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 ml-9 space-y-1">
                  {nav.subItems.map(subItem => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="ml-auto flex items-center gap-1">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/stmall_logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/stmall_dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/stmall.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default AppSidebar
