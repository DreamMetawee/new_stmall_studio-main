import { useEffect, useState } from "react"
import { CustomerContactProps } from "../../props/SendEmail"
import { useLocation, useNavigate } from "react-router"
import { AuthSending } from "../../utils/api"
import Button from "../../components/ui/button/Button"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"


// Declare unlayer
declare const unlayer: any

const EmailEditor = () => {
  const [customerEmail, setCustomerEmail] =
    useState<CustomerContactProps | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const customerFromState = location.state?.customer as
      | CustomerContactProps
      | undefined

    if (customerFromState) {
      if (!customerFromState.subject) {
        customerFromState.subject = "No Subject"
      }
      setCustomerEmail(customerFromState)
      console.log("✔️ Loaded customer from state:", customerFromState)
    } else {
      console.error("❌ No customer data passed to EmailEditor.")
      navigate(-1) // Navigate back to the list page if no data is provided
    }

    // Check if script is already added to prevent re-adding
    if (document.getElementById("unlayer-script")) {
      return // If script already exists, don't load it again
    }

    const script = document.createElement("script")
    script.id = "unlayer-script"
    script.src = "https://editor.unlayer.com/embed.js"
    script.async = true
    script.onload = async () => {
      try {
        unlayer.init({
          id: "editor",
          projectId: 271902,
          displayMode: "email",
          tools: {
            social: {
              properties: {
                icons: {
                  
                  value: {
                    editor: {
                      data: {
                        customIcons: [
                          {
                            name: "LINE",
                            url: "", // เปลี่ยนเป็นลิงก์ LINE ของคุณ
                            icons: {
                              circle:
                                "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
                              "circle-black":
                                "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
                              "circle-white":
                                "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
                              rounded:
                                "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
                              "rounded-black":
                                "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
                              squared:
                                "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
                              "squared-black":
                                "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
                            },
                          },
                          // ✅ ตัวอย่างไอคอนอื่น ถ้าจะใส่ด้วย
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        })

        // unlayer.loadDesign({
        //   body: {
        //     rows: [
        //       {
        //         columns: [
        //           {
        //             contents: [
        //               {
        //                 type: "social",
        //                 values: {
        //                   elements: [
        //                     {
        //                       icon: "custom",
        //                       href: "https://line.me/ti/p/YOUR_LINE_ID",
        //                       title: "LINE",
        //                       content: "LINE",
        //                       image: {
        //                         url: "https://cdn2.iconfinder.com/data/icons/social-media-applications/64/social_media_applications_5-line-64.png",
        //                         width: "24px",
        //                         height: "24px",
        //                       },
        //                     },
        //                     {
        //                       icon: "facebook",
        //                       href: "https://facebook.com/yourcompany",
        //                     },
        //                     {
        //                       icon: "youtube",
        //                       href: "https://youtube.com/@yourcompany",
        //                     },
        //                     {
        //                       icon: "custom",
        //                       href: "https://www.tiktok.com/@yourcompany",
        //                       title: "TikTok",
        //                       content: "TikTok",
        //                       image: {
        //                         url: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
        //                         width: "24px",
        //                         height: "24px",
        //                       },
        //                     },
        //                     {
        //                       icon: "twitter", // หรือ x
        //                       href: "https://x.com/yourcompany",
        //                     },
        //                   ],
        //                 },
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //     ],
        //   },
        // });

        

          const templateID = 608570
        // const res = await AuthSending().get(
        //   `${API_ENDPOINT}${API_VERSION}unlayerKey/templates/${templateID}`
        // )
        // if (res.status === 200) {
        //   // ทำการโหลด template ถ้าการตอบกลับสำเร็จ
        //   const result = res.data
        //   if (result && result.data && result.data.designData) {
        //     unlayer.loadTemplate(result.data.designData)
        //   } else {
        //     console.error("❌ Template data not found")
        //   }
        // } else {
        //   console.error(`❌ Error: ${res.status}`)
        // }
        //
        //  <-- Replace with your template ID from Unlayer
        unlayer.loadTemplate(templateID)
      } catch (error) {
        console.error("❌ Error initializing Unlayer editor:", error)
      }
    }
    document.body.appendChild(script)
  }, [location.state, navigate])

  const sendEmail = async (emailHtml: string) => {
    if (
      !customerEmail?.email ||
      !customerEmail?.subject ||
      !customerEmail?.id
    ) {
      console.error(
        "❌ Missing required customer email, subject, or id:",
        customerEmail
      )
      return
    }

    try {
      const response = await AuthSending().post(
        `${API_ENDPOINT}${API_VERSION}sendEmail/emailEditor`,
        {
          to: customerEmail.email,
          subject: customerEmail.subject,
          html: emailHtml,
          id: customerEmail.id,
        }
      )

      if (response.status === 200) {
        console.log("✅ Email sent successfully.")

        navigate(-1) // Navigate to index.tsx after successful email sending
      } else {
        console.error("❌ Failed to send email:", response)
      }
    } catch (error) {
      console.error("❌ Error sending email:", error)
    }
  }

  const handleSendEmail = () => {
    unlayer.exportHtml((data: { design: any; html: string }) => {
      sendEmail(data.html)
    })
  }

  const loadTemplate = (templateID: number) => {
    if (typeof unlayer !== "undefined"){
      unlayer.loadTemplate(templateID)
      console.log(`✔️ Loaded template ID: ${templateID}`);
    } else {
      console.error("❌ Unlayer is not ready.");
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-header bg-primary rounded-t-lg p-4 text-white">
          <h2 className="text-xl font-bold">Email Editor</h2>
        </div>
        <div className="card-body p-4">
          {/* ปุ่มเลือกเทมเพลต */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => loadTemplate(608570)}>
              โหลด: โปรโมชั่น
            </Button>
            <Button onClick={() => loadTemplate(613594)}>
              โหลด: ตอบลูกค้า
            </Button>
            <Button onClick={() => loadTemplate(613595)}>
              โหลด: ประกาศข่าวสาร
            </Button>
          </div>

          <div id="editor" style={{ height: "600px" }}></div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          className="btn btn-primary hover:bg-primary-focus rounded-lg px-6 py-2 font-semibold text-white shadow transition-all"
          onClick={handleSendEmail}
        >
          Send Email
        </Button>
      </div>
    </div>
  )
}

export default EmailEditor
