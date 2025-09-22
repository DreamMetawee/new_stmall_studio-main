export interface cookiePolicyProps {
  id: number
  cookie_content: string
  cookie_title: string
  created: Date
  updated:Date
  type:string
}

export interface PrivacyPolicyProp {
  id: number
  privacy_title: string
  privacy_content: string
  created: Date
  updated: Date
  type: string
}
export interface ExchangePolicyProp {
  id: number
  exchange_title: string
  exchange_content: string
  created: Date
  updated: Date
  type: string
}
export interface ConditionPolicyProp {
  id: number
  condition_title: string
  condition_content: string
  created: Date
  updated: Date
  type: string
}

export interface CCTVPolicyProp {
  id: number
  cctv_title:string
  cctv_content:string
  created: Date
  updated: Date
  type: string
}

export interface DeliveryTermProp {
  id: number
  delivery_term_title: string
  delivery_term_content: string
  created: Date
  updated: Date
  type: string
}