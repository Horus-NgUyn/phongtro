import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  BoxInfo,
  RelatedPost,
  VoteAndComment,
  VoteOption,
  QuestionAndAnswer,
  MapContainer,
  Slider,
  Report,
} from "../../components"
import icons from "../../ultils/icons"
import { useNavigate, createSearchParams, Link } from "react-router-dom"
import { path } from "../../ultils/constant"
import { apiGetPost } from "../../services/post"
import { useSelector } from "react-redux"
import { apiGetLocationsFromSearchTerm } from "../../services"

const { HiLocationMarker, TbReportMoney, RiCrop2Line, BsStopwatch, BsHash, MdReportProblem } = icons

const DetailPost = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [isVote, setIsVote] = useState(false)
  const { isLoggedIn } = useSelector((state) => state.auth)
  const [render, setRender] = useState(false)
  const [isReport, setIsReport] = useState(null)
  const [locations, setLocations] = useState([])

  const fetchPost = async () => {
    const response = await apiGetPost(postId)
    if (response?.data?.err === 0) setPost(response.data.response)
  }

  useEffect(() => {
    fetchPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, isVote, render])

  useEffect(() => {
    const fetchLocations = async (address) => {
      const response = await apiGetLocationsFromSearchTerm(address)
      if (response.status === 200) {
        if (response.data?.length === 0) {
          const newAddress = address
            .split(",")
            .slice(1)
            .map((el) => el.trim())
            .join(", ")

          const res = await apiGetLocationsFromSearchTerm(newAddress)
          const dataFormat = res.data?.map((el) => ({
            longitude: +el.lon,
            latitude: +el.lat,
            displayName: el.display_name,
          }))
          setLocations(dataFormat)
        } else {
          const dataFormat = response.data?.map((el) => ({
            longitude: +el.lon,
            latitude: +el.lat,
            displayName: el.display_name,
          }))
          setLocations(dataFormat)
        }
      }
    }
    if (post && post.address) {
      fetchLocations(post.address)
    }
  }, [post])
  const handleFilterLabel = () => {
    const titleSearch = `Tìm kiếm tin đăng theo chuyên mục ${post?.labelData?.value}`
    navigate(
      {
        pathname: `/${path.SEARCH}`,
        search: createSearchParams({ labelCode: post?.labelData?.code }).toString(),
      },
      { state: { titleSearch } }
    )
  }
  return (
    <div className="w-full flex gap-4 relative">
      {isVote && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-overlay-30 flex items-center justify-center"
          onClick={() => setIsVote(false)}
        >
          <VoteOption pid={postId} setIsVote={setIsVote} />
        </div>
      )}
      {isReport && isReport?.id && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-overlay-30 flex items-center justify-center"
          onClick={() => setIsReport(null)}
        >
          <Report
            pid={isReport?.id}
            setIsReport={setIsReport}
            title={isReport?.title}
            uid={isReport?.userId}
          />
        </div>
      )}
      <div className="w-[70%]">
        <Slider images={post?.images && JSON.parse(post?.images?.image)} />
        <div className="bg-white rounded-md shadow-md p-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-red-600 flex flex-col gap-2">
              <span>{post?.title}</span>
              {post?.status === "RENTED" && (
                <span className="w-fit text-xs p-2 px-4 inline-block bg-sky-600 text-white font-semibold">
                  Đã cho thuê
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <span>Chuyên mục:</span>
              <span
                className="text-blue-600 underline font-medium hover:text-orange-600 cursor-pointer"
                onClick={handleFilterLabel}
              >
                {post?.labelData?.value}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HiLocationMarker color="#2563eb" />
              <span>{post?.address}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TbReportMoney />
                <span className="font-semibold text-lg text-green-600">{post?.attributes?.price}</span>
              </span>
              <span className="flex items-center gap-1">
                <RiCrop2Line />
                <span>{post?.attributes?.acreage}</span>
              </span>
              <span className="flex items-center gap-1">
                <BsStopwatch />
                <span>{post?.attributes?.published}</span>
              </span>
              <span className="flex items-center gap-1">
                <BsHash />
                <span>{post?.attributes?.hashtag}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsReport(post)}
              className="flex items-center gap-2 text-sm bg-red-800 text-white p-2 w-fit"
            >
              <MdReportProblem />
              <span className="">Report bài đăng</span>
            </button>
          </div>
          <div className="mt-8">
            <h3 className="font-semibold text-xl my-4">Thông tin mô tả</h3>
            <div className="flex flex-col gap-3">
              {typeof post?.description === "object" ? (
                post?.description?.map((item, index) => {
                  return <span key={index}>{item}</span>
                })
              ) : (
                <span>{post?.description}</span>
              )}
            </div>
          </div>
          <div className="mt-8">
            <h3 className="font-semibold text-xl my-4">Đặc điểm tin đăng</h3>
            <table className="w-full">
              <tbody className="w-full">
                <tr className="w-full">
                  <td className="p-2">Mã tin</td>
                  <td className="p-2">{post?.overviews?.code}</td>
                </tr>
                <tr className="w-full bg-gray-200">
                  <td className="p-2">Khu vực</td>
                  <td className="p-2">{post?.overviews?.area}</td>
                </tr>
                <tr className="w-full">
                  <td className="p-2">Loại tin rao</td>
                  <td className="p-2">{post?.overviews?.type}</td>
                </tr>
                <tr className="w-full bg-gray-200">
                  <td className="p-2">Đối tượng</td>
                  <td className="p-2">{post?.overviews?.target}</td>
                </tr>
                <tr className="w-full">
                  <td className="p-2">Gói tin</td>
                  <td className="p-2">{post?.overviews?.bonus}</td>
                </tr>
                <tr className="w-full bg-gray-200">
                  <td className="p-2">Ngày đăng</td>
                  <td className="p-2">{post?.overviews?.created}</td>
                </tr>
                <tr className="w-full">
                  <td className="p-2">Ngày hết hạn</td>
                  <td className="p-2">{post?.overviews?.expired}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-8">
            <h3 className="font-semibold text-xl my-4">Thông tin liên hệ</h3>
            <table className="w-full">
              <tbody className="w-full">
                <tr className="w-full">
                  <td className="p-2">Liên hệ</td>
                  <td className="p-2">{post?.user?.name}</td>
                </tr>
                <tr className="w-full bg-gray-200">
                  <td className="p-2">Điện thoại</td>
                  <td className="p-2">{post?.user?.phone}</td>
                </tr>
                <tr className="w-full">
                  <td className="p-2">Zalo</td>
                  <td className="p-2">{post?.user?.zalo}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full h-[300px]">
            {/* <MapContainer locations={locations} zoom={13} /> */}
          </div>
        </div>
        <div className="mt-4">
          <VoteAndComment votes={post?.votes} star={post?.star} setIsVote={setIsVote} />
        </div>
        {!isLoggedIn ? (
          <div className="shadow-md border rounded-md bg-white p-[10px]">
            <h3 className="font-bold text-[20px]">Hỏi & đáp</h3>
            <span className="py-4">
              Bạn muốn bình luận cho bài đăng này?{" "}
              <Link to={`/${path.LOGIN}`} className="text-blue-500 hover:underline">
                Đi tới đăng nhập nào
              </Link>
            </span>
          </div>
        ) : (
          <QuestionAndAnswer comments={post?.comments} pid={postId} setRender={setRender} />
        )}
      </div>
      <div className="w-[30%] flex flex-col gap-8">
        <BoxInfo userData={post?.user} />
        <RelatedPost />
        <RelatedPost newPost />
      </div>
    </div>
  )
}

export default DetailPost
